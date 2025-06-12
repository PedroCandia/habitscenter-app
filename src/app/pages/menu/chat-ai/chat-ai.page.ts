import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MsgHistoryService } from 'src/app/services/msg-history.service';
import { ChatgptService } from 'src/app/services/chatgpt.service';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-chat-ai',
  templateUrl: './chat-ai.page.html',
  styleUrls: ['./chat-ai.page.scss'],
})
export class ChatAiPage implements OnInit {
  private loadingCtllr = inject(LoadingController);
  private msgHistorySvc = inject(MsgHistoryService);
  private chatgptSvc = inject(ChatgptService);
  private toastCtllr = inject(ToastController);
  private alertController = inject(AlertController);

  @ViewChild('writeMessageInput') writeMessageInput: any;

  userId: any = '';
  chatBotName:string = 'Entrenador';
  messages: any[] = [];
  newMessage: string = '';

  dataChannel: RTCDataChannel | any = null;
  audioElement: HTMLAudioElement | any = {
    current: "",
    autoplay: false
  };
  peerConnection: any = {
    current: "",
  };;
  isSessionActive: boolean = false;
  events:any[] = [];

  // Para limpiar listeners si es necesario
  private messageListener: any;
  private openListener: any;

  constructor() {
  //    // Append new server events to the list
  //   this.dataChannel.addEventListener("message", (e: any) => {
  //     this.events.map((prev:any) => [JSON.parse(e.data), ...prev]);
  //   });

  //   // Set session active when the data channel is opened
  //   this.dataChannel.addEventListener("open", () => {
  //     this.isSessionActive = true;
  //     this.events = [];
  //   });
  }

  ngOnInit() {
    this.userId = localStorage.getItem('temporary_user_id');
    if(this.userId == '' || this.userId == null) {
      this.userId = this.generateUniqueID();
      localStorage.setItem('temporary_user_id', this.userId);
    }
    console.log('USER ID: ', this.userId);


    // if (this.dataChannel) {
    //   // Definir el listener para el evento 'message'
    //   this.messageListener = (e: MessageEvent) => {
    //     const data = JSON.parse(e.data);
    //     // Agregamos el evento al inicio del array
    //     this.events = [data, ...this.events];
    //   };

    //   // Definir el listener para el evento 'open'
    //   this.openListener = () => {
    //     this.isSessionActive = true;
    //     // Reiniciamos la lista de eventos
    //     this.events = [];
    //   };

    //   // Asignamos los listeners
    //   this.dataChannel.addEventListener('message', this.messageListener);
    //   this.dataChannel.addEventListener('open', this.openListener);
    // }
  }

  initDataChannel(dc: RTCDataChannel) {
    // Definir el listener para el evento 'message'
    this.messageListener = (e: MessageEvent) => {
      console.log("Mensaje recibido en dataChannel: ", e.data);
      try {
        const data = JSON.parse(e.data);
        // Agregamos el evento al inicio del array
        this.events = [data, ...this.events];

        // if e.type === response.audio_transcript.delta
        // then show in chat e.delta

        // if e.type === response.audio_transcript.done
        // then show in chat e.transcript
      } catch (error) {
        console.error("Error parseando mensaje:", error);
      }
    };
  
    // Definir el listener para el evento 'open'
    this.openListener = () => {
      console.log("DataChannel abierta");
      this.isSessionActive = true;
      // Reiniciamos la lista de eventos
      this.events = [];
    };
  
    // Asignamos los listeners
    dc.addEventListener('message', this.messageListener);
    dc.addEventListener('open', this.openListener);
  }
  

  ngOnDestroy(): void {
    // Eliminamos los listeners para evitar memory leaks
    if (this.dataChannel) {
      if (this.messageListener) {
        this.dataChannel.removeEventListener('message', this.messageListener);
      }
      if (this.openListener) {
        this.dataChannel.removeEventListener('open', this.openListener);
      }
    }
  }

  async ionViewWillEnter() {
    this.messages = this.msgHistorySvc.getAllMessages(this.chatBotName);
    
    if(this.messages.length === 0) {
      let greetingMessage = '¿Con qué puedo ayudarte?';
      this.messages.push({ sender: 'assistant', text: greetingMessage });

      const loading = await this.loadingCtllr.create();
      await loading.present();

      await this.getAllMessages();

      await loading.dismiss();

      this.msgHistorySvc.setMessages(this.chatBotName, this.messages);
    }

    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  async getAllMessages() {
    // this.userId = this.authSvc.getUserID();
    let allMessages = await this.chatgptSvc.getAllMessages(this.userId, this.chatBotName);

    if(allMessages == "Network response wasnt ok") {
      allMessages = [
        {
          role:"assistant",
          content: [
            {
              text: {
                value: "Sin conexión al servidor.",
              }
            }
          ]
        }
      ]
    }

    allMessages = allMessages.reverse();
    
    allMessages.map((body: any, index:any) => {
      this.messages.push({ sender: body.role === 'user' ? 'user': 'assistant', text: body.content[0]?.text?.value });
    });
  }

  scrollToBottom() {
    const container = document.getElementById('messageContainer');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  generateUniqueID() {
    return uuidv4();
  }

  async sendMessage() {
    if(this.isSessionActive) {
      this.sendRealtimeMsg();
      return;
    }

    if(this.newMessage.length <= 0) {
      const toast = await this.toastCtllr.create({
        message: 'No se encontro ningun mensaje!',
        position: 'middle',
        duration: 2000,
      });
  
      toast.present();
      return;
    }

    const loading = await this.loadingCtllr.create();
    await loading.present();

    if(this.newMessage.length < 256) {
      this.messages.push({ sender: 'user', text: this.newMessage });
      const msg = this.newMessage;
      this.newMessage = '';

      // Enfocar el campo de entrada para poder escribir otro mensaje
      this.writeMessageInput.setFocus();

      setTimeout(() => {
        this.scrollToBottom();
      }, 0);

      await this.getMessageChatGPT(msg);
      this.msgHistorySvc.setMessages(this.chatBotName, this.messages);
    } else {
      this.showAlert('La longitud del mensaje excede el límite permitido de 256 caracteres. La longitud actual es ' + this.newMessage.length);
    }

    await loading.dismiss();

    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  async sendRealtimeMsg() {
    if(this.newMessage.length <= 0) {
      const toast = await this.toastCtllr.create({
        message: 'No se encontro ningun mensaje!',
        position: 'middle',
        duration: 2000,
      });
  
      toast.present();
      return;
    }

    const msg = this.newMessage;
    this.newMessage = '';


    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: msg,
          },
        ],
      },
    };

    this.sendClientEvent(event);
    this.sendClientEvent({ type: "response.create" });
  }

  // Send a message to the model
  sendClientEvent(message: any) {
    if (this.dataChannel) {
      message.event_id = message.event_id || crypto.randomUUID();
      this.dataChannel.send(JSON.stringify(message));
      this.events = [message, ...this.events];
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  async showAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Acción no completada.',
      message: msg,
      buttons: [
        // {
        //   text: 'Cancelar',
        //   role: 'cancel',
        // },
        {
          text: 'Aceptar',
          role: 'accept'
        }
      ],
    });
    await alert.present();
  }

  async getMessageChatGPT(msg: any) {
    const resChatGPT = await this.chatgptSvc.chatgpt(msg, this.chatBotName, this.userId);
    this.messages.push({ sender: 'assistant', text: resChatGPT });
    // this.messages.push({ sender: 'assistant', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' });
  }

  async startSession() {
    // Get an ephemeral key from the Fastify server
    // const tokenResponse = await this.chatgptSvc.getToken();
    const data = await this.chatgptSvc.getToken();
    console.log('Realtime token response: ', data);

    // const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    this.audioElement.current = document.createElement("audio");
    this.audioElement.current.autoplay = true;
    pc.ontrack = (e) => (this.audioElement.current.srcObject = e.streams[0]);

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    this.dataChannel = dc;
    this.initDataChannel(dc); // Asigna los listeners

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpResponse = await this.chatgptSvc.realtime(offer, EPHEMERAL_KEY);

    const answer: any = {
      type: "answer",
      sdp: sdpResponse,
    };
    await pc.setRemoteDescription(answer);

    this.peerConnection.current = pc;
  }

  stopSession() {
    if (this.dataChannel) {
      this.dataChannel.close();
    }

    this.peerConnection.current.getSenders().forEach((sender: any) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (this.peerConnection.current) {
      this.peerConnection.current.close();
    }

    this.isSessionActive = false;
    this.dataChannel = null;
    this.peerConnection.current = null;
  }
}

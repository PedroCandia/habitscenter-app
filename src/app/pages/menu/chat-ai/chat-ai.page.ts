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
  chatBotName:string = 'Neo';
  messages: any[] = [];
  newMessage: string = '';

  constructor() { }

  ngOnInit() {
    this.userId = localStorage.getItem('temporary_user_id');
    if(this.userId == '' || this.userId == null) {
      this.userId = this.generateUniqueID();
      localStorage.setItem('temporary_user_id', this.userId);
    }
    console.log('USER ID: ', this.userId);
  }

  async ionViewWillEnter() {
    this.messages = this.msgHistorySvc.getAllMessages(this.chatBotName);
    if(this.messages.length === 0) {
      const loading = await this.loadingCtllr.create();
      await loading.present();

      await this.getAllMessages();

      if(this.messages.length === 0) {
        let greetingMessage = 'Soy Neo, y si estás aquí, es porque buscas ser del 1%.';
        greetingMessage += ' No estoy aquí para hacerte sentir bien. ¿Estás listo para mejorar o vas a seguir perdiendo el tiempo?';
        this.messages.push({ sender: 'assistant', text: greetingMessage });
      }

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
}

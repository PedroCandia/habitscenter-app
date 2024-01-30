import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ChatgptService } from 'src/app/services/chatgpt.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AdMob, RewardAdOptions, AdLoadInfo, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-ai',
  templateUrl: './chat-ai.component.html',
  styleUrls: ['./chat-ai.component.scss'],
})
export class ChatAiComponent {
  @Input() currentCategoryData: any;
  @Input() currentRubys: any;
  @ViewChild('content') content: any;
  @ViewChild('writeMessageInput') writeMessageInput: any;
  
  private modalController = inject(ModalController);

  private supabaseSvc = inject(SupabaseService);
  private chatgptSvc = inject(ChatgptService);
  private alertController = inject(AlertController);
  private authSvc = inject(AuthService);
  private loadingCtllr = inject(LoadingController);

  onLoadAd = false;
  userId: string = '';
  messages: any[] = []; // Aquí defines una propiedad "messages" que será un arreglo para almacenar los mensajes.
  newMessage: string = ''; // Aquí defines una propiedad "newMessage" para almacenar el nuevo mensaje que el usuario escribirá.

  constructor() { }

  async ionViewWillEnter() {    
    const loading = await this.loadingCtllr.create();
    await loading.present();

    await this.getAllMessages();

    if(this.messages.length === 0) {
      let greetingMessage = 'Bienvenido a HabitsCenter. Soy especialista en ' + this.currentCategoryData.name + '.';
      greetingMessage += ' ¿En qué puedo asistirle hoy?';
      this.messages.push({ sender: 'assistant', text: greetingMessage });
    }

    await loading.dismiss();

    setTimeout(() => {
      this.content.scrollToBottom(0);
    }, 0);
  }

  async getAllMessages() {
    this.userId = this.authSvc.getUserID();
    let allMessages = await this.chatgptSvc.getAllMessages(this.userId, this.currentCategoryData.name);
    allMessages = allMessages.reverse();
    console.log('AllMessages: ', allMessages);
    
    allMessages.map((body: any, index:any) => {
      console.log(index + ' ', body);
      
      this.messages.push({ sender: body.role === 'user' ? 'user': 'assistant', text: body.content[0]?.text?.value });
    });
  }

  async sendMessage() {
    const loading = await this.loadingCtllr.create();
    await loading.present();

    let rubys = await this.supabaseSvc.getRubys();

    if(rubys > 0) {
      if(this.newMessage.length < 256) {
        this.messages.push({ sender: 'user', text: this.newMessage });
        const msg = this.newMessage;
        this.newMessage = '';

        // Enfocar el campo de entrada para poder escribir otro mensaje
        this.writeMessageInput.setFocus();

        setTimeout(() => {
          this.content.scrollToBottom(0);
        }, 0);

        await this.getMessageChatGPT(msg);
        rubys = await this.supabaseSvc.removeOneRuby(rubys);
        this.currentRubys -= 1;
      } else {
        this.showAlert('La longitud del mensaje excede el límite permitido de 256 caracteres. La longitud actual es ' + this.newMessage.length);
      }
    } else {
      this.showAlert('No cuenta con Rubys suficientes.');
    }

    await loading.dismiss();

    setTimeout(() => {
      this.content.scrollToBottom(0);
    }, 0);
  }

  async getMessageChatGPT(msg: any) {
    const resChatGPT = await this.chatgptSvc.chatgpt(msg, this.currentCategoryData.name, this.userId);
    this.messages.push({ sender: 'assistant', text: resChatGPT });
    // this.messages.push({ sender: 'assistant', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' });
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

  closeChat() {
    // this.modalController.dismiss(Number(this.numberOfProducts));
    this.modalController.dismiss(this.currentRubys);
  }

  async showRewardVideo() {
    const loading = await this.loadingCtllr.create();
    await loading.present();

    this.onLoadAd = true;

    AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      // Subscribe prepared rewardVideo
    });

    AdMob.addListener(RewardAdPluginEvents.Rewarded, async (rewardItem: AdMobRewardItem) => {
      // Subscribe user rewarded
      console.log(rewardItem);

      this.currentRubys = await this.supabaseSvc.addOneRuby(this.currentRubys);
      this.onLoadAd = false;
    });

    const userData = JSON.parse(localStorage.getItem('userData') || '');
    const options: RewardAdOptions = {
      adId: environment.google.addMob.app_id,
      isTesting: environment.google.addMob.isTesting,
      // npa: true
      ssv: {
        userId: userData.id
        // customData: JSON.stringify({ ...MyCustomData })
      }
    };
    await AdMob.prepareRewardVideoAd(options);
    const rewardItem = await AdMob.showRewardVideoAd();
    console.log('rewardItem: ', rewardItem);

    await loading.dismiss();
  }
}

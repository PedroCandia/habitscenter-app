import { Component, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ChatgptService } from 'src/app/services/chatgpt.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { AdmobService } from 'src/app/services/admob.service';
import { environment } from 'src/environments/environment';
import { MsgHistoryService } from 'src/app/services/msg-history.service';
// AdMob
import { AdMob } from '@capacitor-community/admob';
// AdMob Rewards
import { RewardAdOptions, AdLoadInfo, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';

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
  private msgHistorySvc = inject(MsgHistoryService);
  public adMobSvc = inject(AdmobService);
  private toastCtllr = inject(ToastController);

  onLoadAd = false;
  userId: string = '';
  messages: any[] = [];
  newMessage: string = '';

  constructor() {}

  async ionViewWillEnter() {
    this.messages = this.msgHistorySvc.getAllMessages(this.currentCategoryData.name);
    if(this.messages.length === 0) {
      const loading = await this.loadingCtllr.create();
      await loading.present();

      await this.getAllMessages();

      if(this.messages.length === 0) {
        let greetingMessage = 'Bienvenido a HabitsCenter. Soy especialista en ' + this.currentCategoryData.name + '.';
        greetingMessage += ' ¿En qué puedo asistirle hoy?';
        this.messages.push({ sender: 'assistant', text: greetingMessage });
      }

      await loading.dismiss();

      this.msgHistorySvc.setMessages(this.currentCategoryData.name, this.messages);
    }

    setTimeout(() => {
      this.content.scrollToBottom(0);
    }, 0);
  }

  async getAllMessages() {
    this.userId = this.authSvc.getUserID();
    let allMessages = await this.chatgptSvc.getAllMessages(this.userId, this.currentCategoryData.name);
    allMessages = allMessages.reverse();
    
    allMessages.map((body: any, index:any) => {
      this.messages.push({ sender: body.role === 'user' ? 'user': 'assistant', text: body.content[0]?.text?.value });
    });
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

        rubys = await this.supabaseSvc.removeOneRuby(rubys);
        this.currentRubys -= 1;
        await this.getMessageChatGPT(msg);
        this.msgHistorySvc.setMessages(this.currentCategoryData.name, this.messages);
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
    if(!this.userId) {
      this.userId = this.authSvc.getUserID();
    }
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

    AdMob.addListener(RewardAdPluginEvents.Loaded, async (info: AdLoadInfo) => {
      // Subscribe prepared rewardVideo
      await loading.dismiss();
    });

    AdMob.addListener(RewardAdPluginEvents.Rewarded, async (rewardItem: AdMobRewardItem) => {
      // Subscribe user rewarded
      const loading = await this.loadingCtllr.create();
      await loading.present();

      this.currentRubys = Number(await this.supabaseSvc.addOneRuby());

      await loading.dismiss();
    });

    if(!this.userId) {
      this.userId = this.authSvc.getUserID();
    }
    const options: RewardAdOptions = {
      adId: environment.google.addMob.ad_reward_id,
      isTesting: environment.google.addMob.isTesting,
      // npa: true
      ssv: {
        userId: this.userId
        // customData: JSON.stringify({ ...MyCustomData })
      }
    };
    await AdMob.prepareRewardVideoAd(options);
    const rewardItem = await AdMob.showRewardVideoAd();
  }
}

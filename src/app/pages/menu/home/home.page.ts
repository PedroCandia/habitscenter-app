import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AuxFnsService } from 'src/app/services/aux-fns.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { environment } from 'src/environments/environment';
import { AdMob, RewardAdOptions, AdLoadInfo, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public authSvc = inject(AuthService);
  private auxFns = inject(AuxFnsService);
  private supabaseSvc = inject(SupabaseService);
  private alertController = inject(AlertController);

  onLoadAd = false;
  onChat:boolean = false;
  currentRubys:any;
  currentCategoryData:any;
  categories: any = [
    { 
      name: 'Salud Mental',
      url: '../../../../assets/img/home/salud_mental/primer_robot_azul.png'
    },
    { 
      name: 'Desarrollo personal',
      url: '../../../../assets/img/home/desarrollo_personal/primer_robot_verde.png'
    },
    { 
      name: 'Alimentación',
      url: '../../../../assets/img/home/alimentacion/primer_robot_naranja.png'
    },
    { 
      name: 'Ejercicio',
      url: '../../../../assets/img/home/ejercicio/primer_robot_rojo.png'
    },
    { 
      name: 'Sueño',
      url: '../../../../assets/img/home/sueño/primer_robot_morado.png'
    },
    { 
      name: 'Relaciones sociales',
      url: '../../../../assets/img/home/relaciones_sociales/primer_robot_amarillo.png'
    },
    { 
      name: 'Gestión del tiempo',
      url: '../../../../assets/img/home/gestion_tiempo/primer_robot_gris.png'
    },
    { 
      name: 'Gestión del estrés',
      url: '../../../../assets/img/home/gestion_estres/primer_robot_rosa.png'
    },
  ];

  constructor() { }

  async ngOnInit() {
    this.currentRubys = await this.supabaseSvc.getRubys();
  }

  //authSvc.getUserEmail()

  goToChat(categoryData:any) {
    this.onChat = true;
    this.currentCategoryData = categoryData;
  }

  async closeChat() {
    const alert = await this.alertController.create({
      header: 'Regresar al menú',
      message: '¿Estás seguro de que deseas regresar al menú? Ten en cuenta que los mensajes actuales serán borrados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          role: 'accept',
          handler: async () => {
            this.onChat = false;
            this.currentCategoryData = null;
          },
        }
      ],
    });
    await alert.present();
  }

  removeOneRuby(rubys:any) {
    this.currentRubys = rubys;
  }

  async signOutGoogle() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar la sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          role: 'accept',
          handler: async () => {
            await this.authSvc.signOutGoogle();
            this.auxFns.navigateTo('/login');
          },
        }
      ],
    });
    await alert.present();
  }

  async showRewardVideo() {
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
      isTesting: true,
      // npa: true
      ssv: {
        userId: userData.id
        // customData: JSON.stringify({ ...MyCustomData })
      }
    };
    await AdMob.prepareRewardVideoAd(options);
    const rewardItem = await AdMob.showRewardVideoAd();
    console.log('rewardItem: ', rewardItem);
  }
}

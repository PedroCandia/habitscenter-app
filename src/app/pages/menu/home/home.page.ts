import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AuxFnsService } from 'src/app/services/aux-fns.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { environment } from 'src/environments/environment';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ChatAiComponent } from 'src/app/components/chat-ai/chat-ai.component';
import { AdmobService } from 'src/app/services/admob.service';
import { GlassfyService } from 'src/app/services/glassfy.service';

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
  private modalController = inject(ModalController);
  private adMobSvc = inject(AdmobService);
  private glassfySvc = inject(GlassfyService);
  private toastCtllr = inject(ToastController);

  // Glassfy
  offerings: any;
  user: any = {
    vip: 'Gratuito'
  };
  vip: boolean = false;

  currentRubys:any;
  categories: any = [
    { 
      name: 'Salud Mental',
      url: '../../../../assets/img/home/salud_mental/primer_robot_azul.png',
      color: '#e5f8ff'
    },
    { 
      name: 'Desarrollo personal',
      url: '../../../../assets/img/home/desarrollo_personal/primer_robot_verde.png',
      color: '#e5fff1'
    },
    { 
      name: 'Alimentación',
      url: '../../../../assets/img/home/alimentacion/primer_robot_naranja.png',
      color: '#fff3e5'
    },
    { 
      name: 'Ejercicio',
      url: '../../../../assets/img/home/ejercicio/primer_robot_rojo.png',
      color: '#ffe5e5'
    },
    { 
      name: 'Sueño',
      url: '../../../../assets/img/home/sueño/primer_robot_morado.png',
      color: '#f9e5ff'
    },
    { 
      name: 'Relaciones sociales',
      url: '../../../../assets/img/home/relaciones_sociales/primer_robot_amarillo.png',
      color: '#fcffe5'
    },
    { 
      name: 'Gestión del tiempo',
      url: '../../../../assets/img/home/gestion_tiempo/primer_robot_gris.png',
      color: '#ece9e9'
    },
    { 
      name: 'Gestión del estrés',
      url: '../../../../assets/img/home/gestion_estres/primer_robot_rosa.png',
      color: '#ffe5fc'
    },
  ];

  constructor() {
    this.glassfySvc.initGlassfy();
    this.offerings = this.glassfySvc.getOfferings();    
  }

  async ngOnInit() {
    if(environment.production) {
      this.currentRubys = await this.supabaseSvc.getRubys();
    }

    this.glassfySvc.user$.subscribe(async user => {
      const toast = await this.toastCtllr.create({
        message: 'Subscribe user: ' + JSON.stringify(user),
        position: 'bottom',
        duration: 2000,
      });
  
      toast.present();
      if(user === undefined || user === null || (user?.vip != 'Gratuito' && user?.vip != 'VIP')) return;

      this.user = user;
      console.log('Subscribe user: ', user);
      
      this.vip = user.vip === 'Gratuito' ? false : true;
      console.log('Is VIP: ', this.vip);

      if(!this.vip) {
        this.banner();
      } else {
        this.adMobSvc.removeBanner();
      }
    });
  }

  async banner() {
    await this.adMobSvc.banner();
  }

  //authSvc.getUserEmail()

  async goToChat(categoryData:any) {
    // this.onChat = true;
    // this.currentCategoryData = categoryData;

    const modal = await this.modalController.create({
      component: ChatAiComponent,
      // cssClass: 'modal-select-quantity-product',
      componentProps: {
        // Aquí puedes pasar propiedades o datos adicionales al modal si es necesario
        // Ejemplo: data: { prop1: valor1, prop2: valor2 }
        currentCategoryData: categoryData,
        currentRubys: this.currentRubys
      }
    });

    modal.onDidDismiss()
      .then((data) => {
        this.currentRubys = Number(data['data']);
    });
  
    await modal.present();
  }

  async closeChat() {
    // this.onChat = false;
    // this.currentCategoryData = null;
    // const alert = await this.alertController.create({
    //   header: 'Regresar al menú',
    //   message: '¿Estás seguro de que deseas regresar al menú? Ten en cuenta que los mensajes actuales serán borrados.',
    //   buttons: [
    //     {
    //       text: 'Cancelar',
    //       role: 'cancel',
    //     },
    //     {
    //       text: 'Aceptar',
    //       role: 'accept',
    //       handler: async () => {
    //         this.onChat = false;
    //         this.currentCategoryData = null;
    //       },
    //     }
    //   ],
    // });
    // await alert.present();
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
            await this.glassfySvc.restore();
            await this.adMobSvc.removeBanner();
            this.auxFns.navigateTo('/login');
          },
        }
      ],
    });
    await alert.present();
  }

  async purchase(sku: any) {
    await this.glassfySvc.purchase(sku);
  }

  async restore() {
    await this.glassfySvc.restore();
    this.vip = false;
  }
}

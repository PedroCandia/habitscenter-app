import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AuxFnsService } from 'src/app/services/aux-fns.service';
import { SupabaseService } from 'src/app/services/supabase.service';
import { environment } from 'src/environments/environment';
import { AlertController, ModalController, NavController, ToastController } from '@ionic/angular';
import { ChatAiComponent } from 'src/app/components/chat-ai/chat-ai.component';
import { AdmobService } from 'src/app/services/admob.service';
// import { GlassfyService } from 'src/app/services/glassfy.service';
import { VipPlansComponent } from 'src/app/components/vip-plans/vip-plans.component';
import { AddHabitComponent } from 'src/app/components/add-habit/add-habit.component';
import { ConfigHabitComponent } from 'src/app/components/config-habit/config-habit.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
// implements OnInit
export class HomePage {
  public authSvc = inject(AuthService);
  private auxFns = inject(AuxFnsService);
  private supabaseSvc = inject(SupabaseService);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);
  private adMobSvc = inject(AdmobService);
  // private glassfySvc = inject(GlassfyService);
  private toastCtllr = inject(ToastController);
  private alertCtllr = inject(AlertController);
  private navCtrl = inject(NavController);

  // Glassfy
  user: any = {
    vip: 'Gratuito'
  };
  vip: boolean = false;

  currentRubys:any = 1;
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
  now: any;
  monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  habits: any;
  streak: number = 0;

  constructor() {
    // this.glassfySvc.initGlassfy();

    const date = new Date();
    const today = date.getDate();
    const currentMonth = this.monthNames[date.getMonth()];
    this.now = today + ' ' + currentMonth + '.';
  }

  ngOnInit() {
    this.checkNewDay();
    this.loadHabits();
    this.loadStreak();
    this.bannerAdMob();
  }
    // if(environment.production) {
    //   this.currentRubys = await this.supabaseSvc.getRubys();
    // }

    // this.glassfySvc.user$.subscribe(async user => {
    //   if(user === undefined || user === null || (user?.vip != 'Gratuito' && user?.vip != 'VIP')) return;

    //   this.user = user;
    //   console.log('Subscribe user: ', user);
      
    //   this.vip = user.vip === 'Gratuito' ? false : true;
    //   console.log('Is VIP: ', this.vip);

    //   const userIsLoggedIn = this.authSvc.userIsLoggedIn();

    //   if(!this.vip && userIsLoggedIn) {
    //     this.banner();
    //   } else {
    //     this.adMobSvc.removeBanner();
    //   }
    // });
  // }

  checkNewDay() {
    this.loadHabits();
    const today = new Date().toDateString(); // Fecha actual
    const lastDate = localStorage.getItem('todayStreak'); // Última fecha guardada
  
    if (lastDate !== today) {
      // Si es un nuevo día, restablecemos los hábitos y el todayStreak
      this.resetHabits();
    }
  }

  resetHabits() {
    this.habits.forEach((habit: any) => {
      habit.checked = false; // Restablecemos el "checked" de cada hábito a false
    });
    this.saveHabits(); // Guardamos los hábitos restablecidos en localStorage
  }

  loadHabits() {
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) {
      this.habits = JSON.parse(storedHabits); // Cargamos los hábitos
      console.log('Hábitos cargados: ', this.habits);
    } else {
      this.habits = []; // Si no hay hábitos guardados, inicializamos como un array vacío
    }
  }
  

  async openComponent() {
    const modal = await this.modalController.create({
      component: AddHabitComponent
    });
    
    modal.onDidDismiss().then((event) => {
      if (event.data && event.data?.nextComponent) {
        if(event.data?.nextComponent) {
          this.goToConfigHabitComponent();
        }
      }
    });
    
    await modal.present();
  }

  async goToConfigHabitComponent() {
    const modal = await this.modalController.create({
      component: ConfigHabitComponent
    });

    modal.onDidDismiss().then((event) => {
      if (event.data && event.data?.loadHabits) {
        if(event.data?.loadHabits) {
          this.loadHabits();
        }
      }
    });
    
    await modal.present();
  }

  async bannerAdMob() {
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
        currentRubys: this.currentRubys,
        vip: this.vip
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

  // async signOutGoogle() {
  //   const alert = await this.alertController.create({
  //     header: 'Cerrar sesión',
  //     message: '¿Estás seguro de que deseas cerrar la sesión?',
  //     buttons: [
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //       },
  //       {
  //         text: 'Aceptar',
  //         role: 'accept',
  //         handler: async () => {
  //           await this.authSvc.signOutGoogle();
  //           await this.glassfySvc.restore();
  //           await this.adMobSvc.removeBanner();
  //           this.auxFns.navigateTo('/login');
  //         },
  //       }
  //     ],
  //   });
  //   await alert.present();
  // }

  // async restore() {
  //   await this.glassfySvc.restore();
  //   this.vip = false;
  // }

  async openModalVIP() {
    const modal = await this.modalController.create({
      component: VipPlansComponent,
    });
  
    await modal.present();
  }

  toggleCheck(habit: any) {
    // Si el hábito ya está marcado, no hacer nada
    if (habit.checked) {
      console.log('Habit is already checked, no action taken.');
      this.loadHabits();
      return; // Salir de la función si ya está marcado
    }

    console.log('Habit checked: ', habit);
    // Alterna el estado de "checked" del hábito
    habit.checked = !habit.checked;
    
    // Guardar los hábitos actualizados en el localStorage
    this.saveHabits();

    // Verificar si todos los hábitos están completados para incrementar la racha
    this.checkStreak();
  }

  saveHabits() {
    // Convertimos la lista de hábitos a string y la guardamos en localStorage
    localStorage.setItem('habits', JSON.stringify(this.habits));
    this.loadHabits();
  }

  checkStreak() {
    const today = new Date().toDateString(); // Fecha de hoy
    const todayStreak = localStorage.getItem('todayStreak');
    // Verificar si todos los hábitos están marcados como "checked"
    const allChecked = this.habits.every((habit:any) => habit.checked);
  
    if (allChecked && todayStreak !== today) {
      this.streak++; // Incrementar la racha
      this.saveStreak(today); // Guardar la nueva racha en localStorage
    }
  }

  saveStreak(today: string) {
    // Guardar la racha en localStorage
    localStorage.setItem('streak', this.streak.toString());
    // Guardar que ya se incrementó la racha hoy
    localStorage.setItem('todayStreak', today);
  }

  loadStreak() {
    const storedStreak = localStorage.getItem('streak');
    if (storedStreak) {
      this.streak = parseInt(storedStreak, 10); // Cargar la racha
    } else {
      this.streak = 0; // Inicializar racha en 0 si no existe
    }
  }
}

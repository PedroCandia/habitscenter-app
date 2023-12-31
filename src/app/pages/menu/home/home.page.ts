import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AuxFnsService } from 'src/app/services/aux-fns.service';
import { SupabaseService } from 'src/app/services/supabase.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public authSvc = inject(AuthService);
  private auxFns = inject(AuxFnsService);
  private supabaseSvc = inject(SupabaseService);

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

  closeChat() {
    this.onChat = false;
    this.currentCategoryData = null;
  }

  removeOneRuby(rubys:any) {
    this.currentRubys = rubys;
  }

  async signOutGoogle() {
    await this.authSvc.signOutGoogle();
    this.auxFns.navigateTo('/login');
  }
}

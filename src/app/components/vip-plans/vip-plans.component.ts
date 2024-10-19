import { Component, OnInit, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlassfyService } from 'src/app/services/glassfy.service';

@Component({
  selector: 'app-vip-plans',
  templateUrl: './vip-plans.component.html',
  styleUrls: ['./vip-plans.component.scss'],
})
export class VipPlansComponent  implements OnInit {
  private modalController = inject(ModalController);
  private glassfySvc = inject(GlassfyService);

  offerings: any;

  constructor() {
    this.offerings = this.glassfySvc.getOfferings();  
  }

  ngOnInit() {}

  
  closeModal() {
    this.modalController.dismiss();
  }

  async purchase(sku: any) {
    await this.glassfySvc.purchase(sku);
    // Quitar el tamaño del anuncio que se tenia puesto
  }
}

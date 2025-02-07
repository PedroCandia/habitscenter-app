import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-serie',
  templateUrl: './add-serie.component.html',
  styleUrls: ['./add-serie.component.scss'],
})
export class AddSerieComponent  implements OnInit {
  flexiones: number = 0;
  private modalController = inject(ModalController);

  constructor() { }

  ngOnInit() {}

  goBack() {
    this.modalController.dismiss();
  }

  registerFlexiones() {
    this.modalController.dismiss({ flexiones: this.flexiones });
  }
}

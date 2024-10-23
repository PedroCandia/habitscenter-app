import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-habit',
  templateUrl: './add-habit.component.html',
  styleUrls: ['./add-habit.component.scss'],
})
export class AddHabitComponent  implements OnInit {
  private modalController = inject(ModalController);

  constructor() { }

  ngOnInit() {}

  goBack() {
    this.modalController.dismiss();
  }

  createHabit() {
    this.modalController.dismiss({ nextComponent: 'ConfigHabitComponent' });
  }
}

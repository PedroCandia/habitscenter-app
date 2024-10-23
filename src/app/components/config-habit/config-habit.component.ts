import { Component, inject, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-config-habit',
  templateUrl: './config-habit.component.html',
  styleUrls: ['./config-habit.component.scss'],
})
export class ConfigHabitComponent  implements OnInit {
  private modalController = inject(ModalController);
  selectedColor: any;
  selectedIcon: any;
  isModalOpen = false;
  isIconModalOpen = false;
  habitName: string = '';

  constructor() { }

  ngOnInit() {}

  goBack() {
    this.modalController.dismiss();
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.setModalOpen(false);
  }

  setModalOpen(status: boolean) {
    this.isModalOpen = status;
  }

  setIconModalOpen(isOpen: boolean) {
    this.isIconModalOpen = isOpen;
  }

  selectIcon(icon: string) {
    this.selectedIcon = icon;
    this.setIconModalOpen(false);
  }

  saveHabit() {
    const habitData = {
      name: this.habitName,
      color: this.selectedColor,
      icon: this.selectedIcon,
      checked: false,
    }

    console.log('Datos de habito guardados correctamente: ', habitData);
    // Guardar los datos en el localStorage
    const storedHabits = localStorage.getItem('habits');
    let habits;
    if (storedHabits) {
      habits = JSON.parse(storedHabits);
      habits.push(habitData);
    } else {
      habits = [habitData];
    };
    
    localStorage.setItem('habits', JSON.stringify(habits));
    this.modalController.dismiss({ loadHabits: true });
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { ChatAiComponent } from 'src/app/components/chat-ai/chat-ai.component';
import { VipPlansComponent } from 'src/app/components/vip-plans/vip-plans.component';
import { AddHabitComponent } from 'src/app/components/add-habit/add-habit.component';
import { ConfigHabitComponent } from 'src/app/components/config-habit/config-habit.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage, ChatAiComponent, VipPlansComponent, AddHabitComponent, ConfigHabitComponent]
})
export class HomePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { ChatAiComponent } from 'src/app/components/chat-ai/chat-ai.component';
import { VipPlansComponent } from 'src/app/components/vip-plans/vip-plans.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage, ChatAiComponent, VipPlansComponent]
})
export class HomePageModule {}

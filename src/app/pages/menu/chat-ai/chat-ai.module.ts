import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatAiPageRoutingModule } from './chat-ai-routing.module';

import { ChatAiPage } from './chat-ai.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatAiPageRoutingModule
  ],
  declarations: [ChatAiPage]
})
export class ChatAiPageModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatAiPage } from './chat-ai.page';

const routes: Routes = [
  {
    path: '',
    component: ChatAiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatAiPageRoutingModule {}

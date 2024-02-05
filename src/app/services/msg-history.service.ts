import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MsgHistoryService {
  assistant: any = {
    // 'Salud Mental' : []
  }
  messages: any = [];

  constructor() { }

  setMessages(assistantName: string, msgs: any) {
    this.assistant[assistantName] = msgs;
  }

  getAllMessages(assistantName: string) {
    return this.assistant[assistantName] || [];
  }
}

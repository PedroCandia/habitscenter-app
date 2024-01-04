import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatgptService {

  constructor() { }

  async chatgpt(msg: any, spcy: string) {
    let res, data;
    const apiUrl = environment.chatgpt.apiURL;

    const requestData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message:msg,
        specialty: spcy
      })
    };
    
    try {
      res = await fetch(apiUrl, requestData);

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      data = await res.json();
  
      console.log('Data Chatgpt: ', data);
    } catch (error) {
      console.log(error);
    }

    return data?.choices[0]?.message?.content || 'Network response wasnt ok';
  }
}

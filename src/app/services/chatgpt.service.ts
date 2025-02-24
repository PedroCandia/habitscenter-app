import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatgptService {
  apiUrl = environment.apiURL;

  constructor() { }

  async getAllMessages(userId: string, spcy: string) {
    let res, data;
    const requestData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        specialty: spcy,
        id: userId
      })
    };

    try {
      res = await fetch(this.apiUrl + '/gpt/getAllMessages', requestData);

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      data = await res.json();
    } catch (error) {
      console.log(error);
    }
    
    return data || 'Network response wasnt ok';
  }

  async chatgpt(msg: any, spcy: string, userId: string) {
    let res, data;
    const requestData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message:msg,
        specialty: spcy,
        id: userId,
      })
    };
    
    try {
      res = await fetch(this.apiUrl + '/gpt/chat', requestData);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      data = await res.json();
    } catch (error) {
      console.log(error);
    }

    return data || 'Network response wasnt ok';
  }

  async getToken() {
    let res, data;
    const requestData = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    try {
      res = await fetch(this.apiUrl + '/gpt/realtime-token', requestData);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      data = await res.json();
    } catch (error) {
      console.log(error);
    }

    return data || 'Network response wasnt ok';
  }

  async realtime(offer: any, EPHEMERAL_KEY:any) {
    let res, data;
    const requestData = {
      method: 'POST',
      body: JSON.stringify({
        offer: offer,
        EPHEMERAL_KEY: EPHEMERAL_KEY
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    try {
      res = await fetch(this.apiUrl + '/gpt/realtime-msg', requestData);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      };
      data = await res.text();
    } catch (error) {
      console.log(error);
    }

    return data || 'Network response wasnt ok';
  }
}
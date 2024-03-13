import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  userData: any;
  supabase: any;
  apiUrl = environment.apiURL;

  constructor() {
    this.supabase = createClient(environment.supabase.auth.supabaseURL, environment.supabase.auth.supabaseKey);
  }

  async createUser(userData:any) {
    let accExists = false;
    
    const { data, error } = await this.supabase.from('users').select().eq('id', userData.id);
    if(data && data[0] && data[0].id) {
      accExists = true;
    }

    if(accExists) {
      return;
    }

    const requestData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: userData.id,
        email: userData.email
      })
    };

    try {
      await fetch(this.apiUrl + '/auth/createAccount', requestData);
    } catch (error) {
      console.log(error);
    }
  }

  async getRubys() {
    if(!this.userData) {
      this.userData = JSON.parse(localStorage.getItem('userData') || '');
    }
    const { data } = await this.supabase.from('users').select().eq('id', this.userData.id);      
    return Number(data[0]?.rubys);
  }

  async removeOneRuby(rubys:any) {
    if(rubys < 1) return rubys;

    let res, newRubys;
    if(!this.userData) {
      this.userData = JSON.parse(localStorage.getItem('userData') || '');
    }
    const requestData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.userData.id
      })
    };
    
    try {
      res = await fetch(this.apiUrl + '/auth/removeRuby', requestData);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      newRubys = await res.json();
    } catch (error) {
      console.log(error);
    }

    return newRubys || 'Error';
  }

  async addOneRuby() {
    let res, newRubys;
    if(!this.userData) {
      this.userData = JSON.parse(localStorage.getItem('userData') || '');
    }
    const requestData = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.userData.id
      })
    };
    
    try {
      res = await fetch(this.apiUrl + '/auth/addRuby', requestData);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      newRubys = await res.json();
    } catch (error) {
      console.log(error);
    }

    return newRubys || 'Error';
  }
}

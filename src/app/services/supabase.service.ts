import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  userData: any;
  supabase: any;

  constructor() {
    this.supabase = createClient(environment.supabase.auth.supabaseURL, environment.supabase.auth.supabaseKey);
  }

  async createUser(data:any) {
    try {
      // Desde el backend mandar solo el id y en el backend poner 3 rubys solo
      await this.supabase.from('users').insert({
        id: data.id,
        rubys: 3
      });
    } catch (error) {
      console.log('ERROR SUPABASE: ', error);
    }
  }

  async getRubys() {
    this.userData = JSON.parse(localStorage.getItem('userData') || '');    

    const { data } = await this.supabase.from('users').select().eq('id', this.userData.id);      
    return Number(data[0]?.rubys);
  }

  async removeOneRuby(rubys:any) {
    if(rubys < 1) return rubys;

    rubys = Number(rubys) - 1;
    this.userData = JSON.parse(localStorage.getItem('userData') || '');
    try {
      await this.supabase.from('users').update({ rubys: rubys }).eq('id', this.userData.id); 
    } catch (error) {
      console.log('Update rubys: ', error);
    }

    return rubys;
  }

  async addOneRuby(rubys:any) {
    rubys = Number(rubys) + 1;

    this.userData = JSON.parse(localStorage.getItem('userData') || '');
    try {
      await this.supabase.from('users').update({ rubys: rubys }).eq('id', this.userData.id);
    } catch (error) {
      console.log('Update rubys: ', error);
    };

    return rubys;
  }
}

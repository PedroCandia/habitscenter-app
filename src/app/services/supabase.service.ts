import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  userData: any;
  supabase: any;

  // update with supabase
  // this.authSvc.supabase.from('user-data').update({ template: true }).eq('user_id', user_id);
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
    return data[0]?.rubys;
  }
}

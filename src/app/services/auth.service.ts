import { Injectable } from '@angular/core';
import { Plugins, registerPlugin } from '@capacitor/core';
import '@codetrix-studio/capacitor-google-auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  async loginWithGoogle() {
    const googleUser = await Plugins["GoogleAuth"]["signIn"](null);
    console.log('user = ', googleUser);  
  }
}

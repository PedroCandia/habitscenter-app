import { Injectable, inject } from '@angular/core';
import '@codetrix-studio/capacitor-google-auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { SupabaseService } from './supabase.service';
import { environment } from 'src/environments/environment';

GoogleAuth.initialize({
  clientId: environment.google.android_client,
  scopes: ['profile', 'email'],
  grantOfflineAccess: false,
});

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: any;
  accessToken: any;
  supabaseSvc = inject(SupabaseService);

  constructor() { }

  async loginWithGoogle() {
    let googleUser;

    try {
      googleUser = await GoogleAuth.signIn();
      this.userData = googleUser;
      localStorage.setItem('userData', JSON.stringify(this.userData));
    } catch (error) {
      console.log('ERROR GOOGLE AUTH: ', error);
    }    

    await this.supabaseSvc.createUser(this.userData);
    
    return googleUser;
  }

  userIsLoggedIn() {
    this.userData = JSON.parse(localStorage.getItem('userData') || '');
    return this.userData.authentication.accessToken;;
  }

  async refreshGoogle() {
    const userAuthCode = await GoogleAuth.refresh();
    this.accessToken = userAuthCode;
    return userAuthCode;
  }

  async signOutGoogle() {
    await GoogleAuth.signOut();
    this.userData = null;
    localStorage.removeItem('userData');
  }

  getUserName() {
    return this.userData?.displayName || '';
  }

  getUserEmail() {
    return this.userData?.email || '';
  }

  getUserImageUrl() {
    return this.userData?.imageUrl || '';
  }
}

import { Injectable, inject } from '@angular/core';
import '@codetrix-studio/capacitor-google-auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { SupabaseService } from './supabase.service';
import { environment } from 'src/environments/environment';
import { AuxFnsService } from './aux-fns.service';

GoogleAuth.initialize({
  clientId: environment.google.android_client,
  scopes: ['profile', 'email'],
  grantOfflineAccess: false,
});

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn: boolean = false;
  userData: any;
  accessToken: any;
  supabaseSvc = inject(SupabaseService);

  constructor(private auxFns: AuxFnsService) { }

  async loginWithGoogle() {
    let googleUser;

    try {
      googleUser = await GoogleAuth.signIn();
      this.userData = googleUser;
      this.userData.displayName = this.auxFns.filterNameTwoWords(this.userData.displayName);
      localStorage.setItem('userData', JSON.stringify(this.userData));
      await this.supabaseSvc.createUser(this.userData);
    } catch (error) {
      console.log('ERROR GOOGLE AUTH: ', error);
    }
    
    return googleUser;
  }

  userIsLoggedIn() {
    const userData = localStorage.getItem('userData');
    if(userData) {
      this.userData = JSON.parse(userData);
    } else {
      return false;
    }

    if(this.userData?.authentication) {
      return this.userData.authentication.accessToken;
    }

    return false;
  }

  async refreshGoogle() {
    const userAuthCode = await GoogleAuth.refresh();
    this.accessToken = userAuthCode;
    return userAuthCode;
  }

  async signOutGoogle() {
    await GoogleAuth.signOut();
    this.userData = null;
    this.isLoggedIn = false;
    localStorage.clear();
  }

  getUserName() {
    return this.userData?.displayName || '';
  }

  getUserEmail() {
    return this.userData?.email || '';
  }

  getUserImageUrl() {    
    if(this.userData?.imageUrl === '' || this.userData?.imageUrl == null || this.userData?.imageUrl == undefined) return '../../../../assets/img/login/icon.png';
    return this.userData?.imageUrl;
  }

  getUserID() {
    return this.userData?.id || '';
  }
}

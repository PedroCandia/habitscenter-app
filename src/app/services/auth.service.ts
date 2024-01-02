import { Injectable } from '@angular/core';
import '@codetrix-studio/capacitor-google-auth';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { AlertController } from '@ionic/angular';

GoogleAuth.initialize({
  clientId: '',
  scopes: ['profile', 'email'],
  grantOfflineAccess: false,
});

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: any;
  accessToken: any;

  constructor(private alertController: AlertController) { }

  async loginWithGoogle() {
    let googleUser, logError;

    try {
      googleUser = await GoogleAuth.signIn();
    } catch (error) {
      logError = error;
    }
    this.userData = googleUser;
    localStorage.setItem('userData', JSON.stringify(this.userData));
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
    localStorage.setItem('userData', '');
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

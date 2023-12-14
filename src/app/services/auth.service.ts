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

  constructor(private alertController: AlertController) { }

  async loginWithGoogle() {
    let googleUser, logError;

    try {
      googleUser = await GoogleAuth.signIn();
    } catch (error) {
      logError = error;
    }
    console.log(googleUser);

    const alert = await this.alertController.create({
      header: 'Login',
      message: 'Usuario: ' + googleUser + '. Error: ' + logError,
      buttons: ['Aceptar']
    });
  
    await alert.present();

    console.log(googleUser);
    this.userData = googleUser;
    return googleUser;
  }

  getUserName() {
    return this.userData.displayName || '';
  }

  getUserEmail() {
    return this.userData.email || '';
  }

  getUserImageUrl() {
    return this.userData.imageUrl || '';
  }
}

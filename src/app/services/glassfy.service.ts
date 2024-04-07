import { Injectable, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Glassfy, GlassfyOffering, GlassfyPermission, GlassfySku, GlassfyTransaction } from 'capacitor-plugin-glassfy';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GlassfyService {
  user = new BehaviorSubject({ vip: 'Gratuito' })
  user$ = this.user.asObservable();

  private offerings: any = new BehaviorSubject([]);

  private toastCtllr = inject(ToastController);
  private alertCtllr = inject(AlertController);
  private authSvc = inject(AuthService);

  constructor() {}

  async initGlassfy() {
    try {
      await Glassfy.initialize({
        apiKey: environment.glassfy.key,
        watcherMode: false
      });

      const userId = this.authSvc.getUserID();
      await Glassfy.connectCustomSubscriber({ subscriberId: userId });

      const permissions = await Glassfy.permissions();
      console.log('permissions: ', permissions);
      const user: any = this.handleExistingPermissions(permissions.all);
      this.user.next(user);

      const offerings = await Glassfy.offerings();
      console.log('OFFERINGS: ', offerings);
      this.offerings.next(offerings.all);
    } catch (error: any) {
      console.log('Error init glassfy: ', error);
      
      const alert = await this.alertCtllr.create({
        header: 'Error de compra',
        message: error,
        buttons: ['Aceptar']
      });

      await alert.present();
    }
  }

  handleExistingPermissions(permissions: GlassfyPermission[]) {
    let user;
    for(const perm of permissions) {
      if(perm.isValid) {
        if(perm.permissionId === 'remove_ads') {
          user = this.user.getValue();
          user.vip = 'VIP'
        }
        // else if(perm.permissionId === 'rubys_infinitos') {
        //   const user = this.user.getValue();
        //   user.vip = 'VIP'
        //   this.user.next(user);
        // }
      }
    }
    return user;
  }

  getOfferings() {
    return this.offerings.asObservable();
  }

  async purchase(sku: GlassfySku) {
    try {
      const permissions:any = await Glassfy.purchaseSku({ sku });
      console.log('Transaccion: ', permissions);

      const toast = await this.toastCtllr.create({
        message: 'Transaccion: ' + JSON.stringify(permissions),
        position: 'top',
        duration: 2000,
      });

      toast.present();

      const user: any = this.handleExistingPermissions(permissions.all);
      const toast1 = await this.toastCtllr.create({
        message: 'Check user vip: ' + JSON.stringify(user),
        position: 'top',
        duration: 2000,
      });

      toast1.present();
      if(user.vip) {
        this.user.next({ vip: 'VIP' });
      }

      // if(transaction.receiptValidated) {
      //   this.handleSuccessfulTransactionResult(transaction, sku);
      // }
    } catch (error) {
      const toast = await this.toastCtllr.create({
        message: 'Transaccion error: ' + JSON.stringify(error),
        position: 'top',
        duration: 2000,
      });

      toast.present();
    }
  }

  async handleSuccessfulTransactionResult(
    transaction: GlassfyTransaction,
    sku: GlassfySku
  ) {
    if(transaction.productId.indexOf('vip_month_10') >= 0) {
      const user = this.user.getValue();
      user.vip = 'VIP'
      this.user.next(user);
    }

    if(transaction.productId.indexOf('vip_yearly_100') >= 0) {
      const user = this.user.getValue();
      user.vip = 'VIP'
      this.user.next(user);
    }

    const toast = await this.toastCtllr.create({
      message: 'Gracias por tu compra!',
      position: 'bottom',
      duration: 2000,
    });

    toast.present();
  }

  async restore() {
    const permissions = await Glassfy.restorePurchases();
    this.user.next({ vip: 'Gratuito' });
    this.offerings.next([]);
    console.log('Permisos vip: ', permissions);
  }
}

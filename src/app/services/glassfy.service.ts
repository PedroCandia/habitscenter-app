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
    }
  }

  handleExistingPermissions(permissions: GlassfyPermission[]) {
    let user = this.user.getValue();
    for(const perm of permissions) {
      if(perm.isValid) {
        if(perm.permissionId === 'remove_ads') {
          user.vip = 'VIP';
        }
      }
    }
    return user;
  }

  getOfferings() {
    return this.offerings.asObservable();
  }

  async purchase(sku: GlassfySku) {
    try {
      const transaction:any = await Glassfy.purchaseSku({ sku });
      let user: any = this.handleExistingPermissions(transaction.permissions.all);
      this.user.next(user);

      const toast1 = await this.toastCtllr.create({
        message: 'Compra finalizada exitosamente!',
        position: 'bottom',
        duration: 2000,
      });
  
      toast1.present();
      
    } catch (error:any) {
      console.log('Error de transaccion: ', error);

      // Error es un objeto vacio, aqui entra
      const toast = await this.toastCtllr.create({
        message: 'Error en la compra, vuelva a intentarlo mas tarde!',
        position: 'bottom',
        duration: 2000,
      });
  
      toast.present();
    }
  }

  async restore() {
    const permissions = await Glassfy.restorePurchases();
    this.user.next({ vip: 'Gratuito' });
    this.offerings.next([]);
    console.log('Permisos vip: ', permissions);
  }
}

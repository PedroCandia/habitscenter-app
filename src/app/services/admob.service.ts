import { Injectable, inject } from '@angular/core';
import { LoadingController } from '@ionic/angular';
// AdMob
import { AdMob } from '@capacitor-community/admob';
// AdMob Banners
import { BannerAdOptions, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, AdMobBannerSize } from '@capacitor-community/admob';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdmobService {
  private loadingCtllr = inject(LoadingController);
  private supabaseSvc = inject(SupabaseService);
  private authSvc = inject(AuthService);
  userId: string = '';

  constructor() {}

  async initialize() {
    await AdMob.initialize({});
  }

  async banner() {
    AdMob.addListener(BannerAdPluginEvents.Loaded, async () => {
      // Subscribe Banner Event Listener
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
      // Subscribe Change Banner Size
      const appMargin = parseInt(String(size.height), 10);
      if (appMargin > 0) {
        const app: any = document.querySelector('ion-app');
        app.style.marginBottom = appMargin + 'px';
      }
    });

    if(!this.userId) {
      this.userId = this.authSvc.getUserID();
    }
    const options: BannerAdOptions = {
      adId: environment.google.addMob.ad_banner_id,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: environment.google.addMob.isTesting,
      
      // npa: true
    };
    AdMob.showBanner(options);
  }

  removeBanner() {
    AdMob.removeBanner();
  }
}

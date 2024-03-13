import { Component, OnInit, inject } from '@angular/core';
import { AdmobService } from './services/admob.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private adMobSvc = inject(AdmobService);

  constructor() { }

  async ngOnInit() {
    await this.adMobSvc.initialize();
    await this.banner();
  }

  async banner() {
    await this.adMobSvc.banner();
  }
}
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AuxFnsService } from 'src/app/services/aux-fns.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(public authSvc: AuthService, private auxFns: AuxFnsService) { }

  async signOutGoogle() {
    await this.authSvc.signOutGoogle();
    this.auxFns.navigateTo('/login');
  }
}

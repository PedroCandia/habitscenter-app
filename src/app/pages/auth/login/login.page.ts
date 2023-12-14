import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AuxFnsService } from 'src/app/services/aux-fns.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  constructor(private authSvc: AuthService, private auxFns: AuxFnsService) { }

  async loginWithGoogle() {    
    const user = await this.authSvc.loginWithGoogle();

    if(user) {
      this.auxFns.navigateTo('/home');
    }
  }
}

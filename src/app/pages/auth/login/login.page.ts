import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AuxFnsService } from 'src/app/services/aux-fns.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private authSvc: AuthService, private auxFns: AuxFnsService) { }

  async ngOnInit() {
    const accessToken = await this.authSvc.refreshGoogle();
    if(accessToken) {
      this.auxFns.navigateTo('/home');
      this.authSvc.isLoggedIn = true;
    }
  }

  async loginWithGoogle() {    
    const user = await this.authSvc.loginWithGoogle();

    if(user) {      
      this.auxFns.navigateTo('/home');
      this.authSvc.isLoggedIn = true;
    }
  }
}

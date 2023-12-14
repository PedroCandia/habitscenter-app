import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuxFnsService } from '../services/aux-fns.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authSvc: AuthService, private auxFns: AuxFnsService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const accessToken = this.authSvc.userIsLoggedIn();
    if(accessToken) {
      console.log('AccessToken: ', accessToken);
      
      // this.auxFns.navigateTo('/home');
      return true;
    }
    return false;
  }
}
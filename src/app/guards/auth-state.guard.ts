import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuxFnsService } from '../services/aux-fns.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateGuard implements CanActivate {

  constructor(private authSvc: AuthService, private auxFns: AuxFnsService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): any {
      if (!this.authSvc.isLoggedIn) return true;

      this.auxFns.navigateTo('/home');
  }
  
}

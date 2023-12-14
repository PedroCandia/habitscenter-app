import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuxFnsService {

  constructor(private router: Router) { }

  navigateTo(link: string) {
    this.router.navigate([link]);
  }
}

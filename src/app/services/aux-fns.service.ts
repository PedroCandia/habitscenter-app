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

  filterNameTwoWords(name: string) {
    // Dividir el texto en palabras separadas por espacios en blanco
    const words = name.split(" ");

    // Verificar si hay al menos dos palabras
    if (words.length >= 2) {
        // Unir las primeras dos palabras y devolverlas
        return words.slice(0, 2).join(" ");
    } else {
        // Si hay menos de dos palabras, devolver el texto original
        return name;
    }
  }
}

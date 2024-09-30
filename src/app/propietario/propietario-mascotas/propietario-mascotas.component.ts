import { Component, OnInit } from '@angular/core';
import { PropietarioService } from 'src/app/service/propietario.service';

@Component({
  selector: 'app-propietario-mascotas',
  templateUrl: './propietario-mascotas.component.html',
  styleUrls: ['./propietario-mascotas.component.css']
})
export class PropietarioMascotasComponent implements OnInit {

  mascotas: any[] = [];
  filteredMascotas: any[] = [];
  propietarioNombre: string = '';

  constructor(private propietarioService: PropietarioService) { }

  ngOnInit() {
    const userEmail = localStorage.getItem('currentUserEmail');
    if (userEmail) {
      const propietario = this.propietarioService.findPropietarioByEmail(userEmail);
      if (propietario) {
        this.propietarioNombre = propietario.nombre;
        this.mascotas = propietario.mascotas;
        this.filteredMascotas = [...this.mascotas];
      }
    }
  }

  buscarMascotas() {
    const searchInput = (document.getElementById('searchInput') as HTMLInputElement).value.toLowerCase();
    this.filteredMascotas = this.mascotas.filter(mascota => 
      mascota.nombre.toLowerCase().includes(searchInput) ||
      mascota.raza.toLowerCase().includes(searchInput)
    );
  }

}
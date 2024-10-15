import { Component, OnInit } from '@angular/core';
import { Mascota } from 'src/app/mascota/mascota';
import { Veterinario } from 'src/app/veterinario/veterinario';
import { Medicamento } from 'src/app/tratamiento/medicamento';
import { Tratamiento } from 'src/app/tratamiento/tratamiento';
import { MascotaService } from 'src/app/service/mascota.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicamentoService } from 'src/app/service/medicamento.service';
import { TratamientoService } from 'src/app/service/tratamiento.service';

@Component({
  selector: 'app-asignar-tratamiento',
  templateUrl: './asignar-tratamiento.component.html',
  styleUrls: ['./asignar-tratamiento.component.css']
})
export class AsignarTratamientoComponent implements OnInit {
  tratamiento: Tratamiento = {
    id: 0,
    fecha: new Date(), // Se inicializa con la fecha actual o puede ser null si lo prefieres
    mascota: {} as Mascota, // Un objeto vacío o la estructura inicial de la mascota
    veterinario: {} as Veterinario,
    medicamento: {} as Medicamento // Un objeto vacío o la estructura inicial del medicamento
  };

  mascotas: Mascota[] = []; // Variable para almacenar las mascotas
  medicamentos: Medicamento[] = []; // Variable para almacenar los medicamentos
  cantidad: number = 1;
  errorMensaje: string = '';
  cantidadValida: boolean = false;

  constructor(
    private mascotaService: MascotaService,
    private medicamentoService: MedicamentoService,
    private tratamientoService: TratamientoService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMascotas(); // Llamar al método que carga las mascotas}
    this.loadMedicamentos(); // Llamar al método que carga los medicamentos
  }

  loadMascotas(): void {
    this.mascotaService.findAll().subscribe(
      (data: Mascota[]) => {
        this.mascotas = data; // Asignar las mascotas obtenidas
      },
      (error) => {
        console.error('Error fetching mascotas:', error);
      }
    );
  }

  loadMedicamentos(): void {
    this.medicamentoService.findAll().subscribe(
      (data) => {
        this.medicamentos = data;
      },
      (error) => {
        console.error('Error al cargar medicamentos:', error);
      }
    );
  }

  onMedicamentoChange(): void {
    this.cantidad = 0;
    this.errorMensaje = '';
    this.cantidadValida = false;
  }

  verificarDisponibilidad(): void {
    if (this.tratamiento.medicamento.id && this.cantidad > 0) {
      this.medicamentoService.findMedicamentoById(this.tratamiento.medicamento.id).subscribe(
        (medicamento) => {
          if (medicamento.unidadesDisponibles >= this.cantidad) {
            this.cantidadValida = true;
            this.errorMensaje = '';
          } else {
            this.cantidadValida = false;
            this.errorMensaje = `Solo hay ${medicamento.unidadesDisponibles} unidades disponibles.`;
          }
        },
        (error) => {
          console.error('Error al verificar disponibilidad:', error);
          this.errorMensaje = 'Error al verificar disponibilidad.';
          this.cantidadValida = false;
        }
      );
    } else {
      this.cantidadValida = false;
    }
  }

  onSubmit(): void {
    if (this.cantidadValida) {
      // Primero, actualizar el inventario del medicamento
      this.medicamentoService.findMedicamentoById(this.tratamiento.medicamento.id).subscribe(
        (medicamento) => {
          medicamento.unidadesDisponibles -= this.cantidad;
          medicamento.unidadesVendidas += this.cantidad;
          
          this.medicamentoService.updateMedicamento(medicamento).subscribe(
            () => {
              // Luego, crear el tratamiento
              this.tratamientoService.addTratamiento(this.tratamiento).subscribe(
                (tratamientoCreado) => {
                  console.log('Tratamiento creado:', tratamientoCreado);
                  // Redirigir o mostrar mensaje de éxito
                  this.router.navigate(['/adminPanel']);
                },
                (error) => {
                  console.error('Error al crear tratamiento:', error);
                  this.errorMensaje = 'Error al crear el tratamiento.';
                }
              );
            },
            (error) => {
              console.error('Error al actualizar inventario:', error);
              this.errorMensaje = 'Error al actualizar el inventario.';
            }
          );
        },
        (error) => {
          console.error('Error al obtener medicamento:', error);
          this.errorMensaje = 'Error al obtener información del medicamento.';
        }
      );
    }
  }
}

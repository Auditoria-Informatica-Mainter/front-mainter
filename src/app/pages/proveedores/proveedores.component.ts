import { Component } from '@angular/core';
import { ProveedoresService } from '../../services/proveedores.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.css'
})
export class ProveedoresComponent {
  proveedor: any;
  proveedores: any[] = [];
  proveedorUpdate: any;
  proveedorIdSelected: any;
  isModalRegisterProveedorOpen: boolean = false;
  isModalUpdateProveedorOpen: boolean = false;
constructor(private proveedorService: ProveedoresService) { }

  ngOnInit(): void {
    this.getProveedores();
  }

  getProveedores(): void {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedor = data;
      },
      error: (error) => {
        console.error('Error al obtener las Categorias', error);
      }
    });
  }

  activeRegisterForm() {
    this.isModalRegisterProveedorOpen = true;
  }
  openModalToUpdateProveedor(proveedor: any) {
    console.log('categoria id: ' + proveedor.id);
    this.isModalUpdateProveedorOpen = true;
    this.proveedorUpdate = proveedor.nombre;
    this.proveedorIdSelected = proveedor.id;
  }
   deleteProveedor(proveedor: any) {
      this.proveedorService.deleteProveedor(proveedor.id).subscribe(
        {
          next: (resp: any) => {
            console.log(resp);
            this.getProveedores();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Proveedor eliminada!",
              showConfirmButton: false,
              timer: 2500
            });
          },
          error: (error: any) => {
            console.log(error);
  
          }
        }
      );
}
}
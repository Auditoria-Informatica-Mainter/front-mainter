import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { SubcategoriasService } from '../../services/subcategorias.service';

@Component({
  selector: 'app-subcategorias',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './subcategorias.component.html',
  styleUrl: './subcategorias.component.css'
})
export class SubcategoriasComponent {

  subcategorias: any[] = [];
  subcategoria: any;
  subcategoriaUpdate: any;
  nuevaSubcategoria: any = { nombre: '' };
  nombreSubcategoria: string = '';
  subcategoriaIdSelected: any;
  isModalRegisterSubcategoriaOpen: boolean = false;
  isModalUpdateSubcategoriaOpen: boolean = false;

  constructor(private subcategoriasService: SubcategoriasService) { }

  ngOnInit(): void {
    this.getSubcategorias();
  }

  getSubcategorias(): void {
    this.subcategoriasService.getSubcategorias().subscribe({
      next: (data) => {
        this.subcategorias = data;
      },
      error: (error) => {
        console.error('Error al obtener las subcategorias', error);
      }
    });
  }

  createSubcategoria(): void {
    if (!this.nuevaSubcategoria.nombre.trim()) return;
    this.subcategoriasService.createSubcategoria(this.nuevaSubcategoria).subscribe({
      next: (data) => {
        this.subcategorias.push(data);
        this.nuevaSubcategoria = { nombre: '' };
        this.getSubcategorias();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Subcategoria registrada!",
          showConfirmButton: false,
          timer: 2500
        });
        setTimeout(() => {
          this.closeRegisterSubcategoriaModal();
        }, 2600);
      },
      error: (error: any) => {
        console.log('Error al registrar la subcategoria:', error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error al registrar la subcategoria!",
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  activeRegisterForm() {
    this.isModalRegisterSubcategoriaOpen = true;
  }

  openModalToUpdateSubcategoria(subcategoria: any) {
    console.log('subcategoria id: ' + subcategoria.id);
    this.isModalUpdateSubcategoriaOpen = true;
    this.subcategoriaUpdate = subcategoria.nombre;
    this.subcategoriaIdSelected = subcategoria.id;
  }

  updateSubcategoria() {
    let subcategoriaData = {
      nombre: this.subcategoriaUpdate,
    };
    this.subcategoriasService.updateSubcategoria(this.subcategoriaIdSelected, subcategoriaData).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp) {
            this.getSubcategorias();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Subcategoria actualizado!",
              showConfirmButton: false,
              timer: 2500
            });

            setTimeout(() => {
              this.closeUpdateSubcategoriaModal();
            }, 2600);
          }

        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );
  }

  deleteSubcategoria(subcategoria: any) {
    this.subcategoriasService.deleteSubcategoria(subcategoria.id).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          this.getSubcategorias();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Subcategoria eliminado!",
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
  closeRegisterSubcategoriaModal() {
    this.isModalRegisterSubcategoriaOpen = false;
  }

  closeUpdateSubcategoriaModal() {
    this.isModalUpdateSubcategoriaOpen = false;
  }
}
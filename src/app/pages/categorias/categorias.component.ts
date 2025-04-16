import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { CategoriasService } from '../../services/categorias.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.css'
})
export default class CategoriasComponent {

  categorias: any[] = [];
  categoria: any;
  categoriaUpdate: any;
  nuevoCategoria: any = { nombre: '' };
  nombreCategoria: string = '';
  categoriaIdSelected: any;
  isModalRegisterCategoriaOpen: boolean = false;
  isModalUpdateCategoriaOpen: boolean = false;

  constructor(private categoriaService: CategoriasService) { }

  ngOnInit(): void {
    this.getCategorias();
  }

  getCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Error al obtener las Categorias', error);
      }
    });
  }

  XcreateCategoria(): void {
    if (!this.nuevoCategoria.nombre.trim()) return;
    this.categoriaService.createCategoria(this.nuevoCategoria).subscribe({
      next: (data) => {
        this.categorias.push(data);
        this.nuevoCategoria = { nombre: '' };
        this.getCategorias();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Categoria registrada!",
          showConfirmButton: false,
          timer: 2500
        });
        setTimeout(() => {
          this.closeRegisterCategoriaModal();
        }, 2600);
      },
      error: (error: any) => {
        console.log('Error al registrar la categoria:', error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error al registrar la categoria!",
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  activeRegisterForm() {
    this.isModalRegisterCategoriaOpen = true;
  }

  openModalToUpdateCategoria(categoria: any) {
    console.log('categoria id: ' + categoria.id);
    this.isModalUpdateCategoriaOpen = true;
    this.categoriaUpdate = categoria.nombre;
    this.categoriaIdSelected = categoria.id;
  }

  XupdateCategoria() {
    let categoriaData = {
      nombre: this.categoriaUpdate,
    };
    this.categoriaService.updateCategoria(this.categoriaIdSelected, categoriaData).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp) {
            this.getCategorias();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Categoria actualizada!",
              showConfirmButton: false,
              timer: 2500
            });

            setTimeout(() => {
              this.closeUpdateCategoriaModal();
            }, 2600);
          }

        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );
  }

  createCategoria(): void {
    if (!this.nuevoCategoria.nombre.trim()) return;

    const subcategoriaPayload = {
      nombre: this.nuevoCategoria.nombre.trim(),
      categoria: 1 //por defecto
    };

    this.categoriaService.createCategoria(subcategoriaPayload).subscribe({
      next: (data) => {
        this.categorias.push(data);
        this.nuevoCategoria = { nombre: '' };
        this.getCategorias();
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Categoria registrada!",
          showConfirmButton: false,
          timer: 2500
        });
        setTimeout(() => {
          this.closeRegisterCategoriaModal();
        }, 2600);
      },
      error: (error: any) => {
        console.log('Error al registrar la categoria:', error);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Error al registrar la categoria!",
          showConfirmButton: false,
          timer: 2500
        });
      }
    });
  }

  updateCategoria() {
    const categoriaData = {
      nombre: this.categoriaUpdate.trim(),
      categoria: 1 // pertenece a la categoría por defecto
    };

    this.categoriaService.updateCategoria(this.categoriaIdSelected, categoriaData).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp) {
            this.getCategorias();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Categoria actualizada!",
              showConfirmButton: false,
              timer: 2500
            });

            setTimeout(() => {
              this.closeUpdateCategoriaModal();
            }, 2600);
          }
        },
        error: (error: any) => {
          console.log(error);
        }
      }
    );
  }

  deleteCategoria(categoria: any) {
    this.categoriaService.deleteCategoria(categoria.id).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          this.getCategorias();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Categoria eliminada!",
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
  closeRegisterCategoriaModal() {
    this.isModalRegisterCategoriaOpen = false;
  }

  closeUpdateCategoriaModal() {
    this.isModalUpdateCategoriaOpen = false;
  }
}

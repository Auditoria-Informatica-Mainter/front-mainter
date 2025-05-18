import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { PreProductoService } from '../../services/pre-producto.service';

@Component({
  selector: 'app-preproductos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './pre-producto.component.html',
  styleUrl: './pre-producto.component.css'
})
export class PreProductoComponent implements OnInit {
  preProductos: any[] = [];
  preProductosFiltrados: any[] = [];
  filtro: string = '';

  nuevoPreProducto: any = {
    nombre: '',
    descripcion: '',
    stock: null,
    tiempo: '',
    url_Image: ''
  };

  preProductoUpdate: any = {
    id: null,
    nombre: '',
    descripcion: '',
    stock: null,
    tiempo: '',
    url_Image: ''
  };

  isModalRegisterOpen: boolean = false;
  isModalUpdateOpen: boolean = false;

  constructor(private preProductoService: PreProductoService) {}

  ngOnInit(): void {
    this.getPreProductos();
  }

  getPreProductos(): void {
    Swal.fire({ title: 'Cargando pre-productos...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
    this.preProductoService.getPreProductos().subscribe({
      next: (data) => {
        this.preProductos = data;
        this.preProductosFiltrados = data;
        Swal.close();
      },
      error: (error) => {
        console.error('Error al obtener pre-productos', error);
        Swal.close();
      }
    });
  }

  buscarPreProductos(): void {
    const termino = this.filtro.trim().toLowerCase();
    this.preProductosFiltrados = termino === ''
      ? this.preProductos
      : this.preProductos.filter(p => p.nombre.toLowerCase().includes(termino));
  }

  openRegisterModal(): void {
    this.nuevoPreProducto = {
      nombre: '',
      descripcion: '',
      stock: null,
      tiempo: '',
      url_Image: ''
    };
    this.isModalRegisterOpen = true;
  }

  createPreProducto(): void {
    const { nombre, descripcion, stock, tiempo } = this.nuevoPreProducto;
    if (!nombre || !descripcion || stock == null || !tiempo) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;
    }

    this.preProductoService.createPreProducto(this.nuevoPreProducto).subscribe({
      next: () => {
        this.getPreProductos();
        Swal.fire('Pre-producto registrado', '', 'success');
        this.closeRegisterModal();
      },
      error: (err) => {
        console.error('Error al registrar pre-producto', err);
        Swal.fire('Error al registrar el pre-producto', '', 'error');
      }
    });
  }

  openUpdateModal(pre: any): void {
    this.preProductoUpdate = { ...pre };
    this.isModalUpdateOpen = true;
  }

  updatePreProducto(): void {
    const { id, nombre, descripcion, stock, tiempo, url_Image } = this.preProductoUpdate;
    if (!id || !nombre || !descripcion || stock == null || !tiempo) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;
    }

    this.preProductoService.updatePreProducto(id, {
      nombre,
      descripcion,
      stock,
      tiempo,
      url_Image
    }).subscribe({
      next: () => {
        this.getPreProductos();
        Swal.fire('Pre-producto actualizado', '', 'success');
        this.closeUpdateModal();
      },
      error: (err) => {
        console.error('Error al actualizar pre-producto', err);
        Swal.fire('Error al actualizar el pre-producto', '', 'error');
      }
    });
  }

  deletePreProducto(pre: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.preProductoService.deletePreProducto(pre.id).subscribe({
          next: () => {
            this.getPreProductos();
            Swal.fire('Pre-producto eliminado', '', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar pre-producto', err);
            Swal.fire('Error al eliminar el pre-producto', '', 'error');
          }
        });
      }
    });
  }

  closeRegisterModal(): void {
    this.isModalRegisterOpen = false;
  }

  closeUpdateModal(): void {
    this.isModalUpdateOpen = false;
  }
}
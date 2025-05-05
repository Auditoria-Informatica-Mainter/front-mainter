import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialesService } from '../../services/materiales.service';
import { SectorService } from '../../services/sector.service';
import { CategoriasService } from '../../services/categorias.service';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materiales.component.html'
})
export class MaterialesComponent implements OnInit {
  materiales: any[] = [];
  sectores: any[] = [];
  categorias: any[] = [];

  materialSeleccionado: any = null;
  XnuevoMaterial: any = {
    nombre: '',
    descripcion: '',
    unidadMedida: '',
    stockActual: 0,
    stockMinimo: 0,
    imagen: '',
    categoriaId: null,
    sectorId: null
  };

  nuevoMaterial = {
    nombre: '',
    stockActual: 0,
    unidadMedida: '',
    stockMinimo: 0,
    categoriaId: null,
    descripcion: '',
    imagen: ''
  };
  busquedaNombre: string = '';
  proveedorId: number = 0;
  actualizacionStock: { id: number, cantidad: number } = { id: 0, cantidad: 0 };
  actualizacionImagen: { id: number, imagen: string } = { id: 0, imagen: '' };

  // Modales
  isModalRegisterMaterialesOpen: boolean = false;
  isModalUpdateMaterialesOpen: boolean = false;

  constructor(
    private materialesService: MaterialesService,
    private sectorService: SectorService,
    private categoriasService: CategoriasService
  ) {}

  ngOnInit(): void {
    this.obtenerMateriales();
    this.obtenerSectores();
    this.obtenerCategorias();
  }

  obtenerMateriales() {
    this.materialesService.getMateriales().subscribe(data => this.materiales = data);
  }

  obtenerSectores() {
    this.sectorService.getSectores().subscribe(data => this.sectores = data);
  }

  obtenerCategorias() {
    this.categoriasService.getCategorias().subscribe(
      (data) => {
        this.categorias = data;
      },
      (error) => {
        console.error('Error al obtener categorías', error);
      }
    );
  }

  crearMaterial() {
    this.materialesService.createMaterial(this.nuevoMaterial).subscribe(() => {
      this.obtenerMateriales();
      this.limpiarFormularioMaterial();
      this.closeRegisterMaterialModal();
    });
  }

  actualizarMaterial() {
    if (!this.materialSeleccionado) return;

    this.materialesService.updateMaterial(
      this.materialSeleccionado.id,
      this.materialSeleccionado
    ).subscribe(() => {
      this.obtenerMateriales();
      this.materialSeleccionado = null;
      this.closeUpdateMaterialModal();
    });
  }

  eliminarMaterial(id: number) {
    this.materialesService.deleteMaterial(id).subscribe(() => this.obtenerMateriales());
  }

  buscarPorNombre() {
    this.materialesService.buscarPorNombre(this.busquedaNombre).subscribe(data => this.materiales = data);
  }

  buscarPorProveedor() {
    this.materialesService.getPorProveedor(this.proveedorId).subscribe(data => this.materiales = data);
  }

  obtenerBajoStock() {
    this.materialesService.getBajoStock().subscribe(data => this.materiales = data);
  }

  obtenerReabastecimiento() {
    this.materialesService.getNecesitanReabastecimiento().subscribe(data => this.materiales = data);
  }

  actualizarStock() {
    this.materialesService.actualizarStock(this.actualizacionStock.id, { cantidad: this.actualizacionStock.cantidad })
      .subscribe(() => this.obtenerMateriales());
  }

  actualizarImagen() {
    this.materialesService.actualizarImagen(this.actualizacionImagen.id, { imagen: this.actualizacionImagen.imagen })
      .subscribe(() => this.obtenerMateriales());
  }

  buscar(query: string) {
    this.materialesService.buscar(query).subscribe(data => this.materiales = data);
  }

  activeRegisterMaterialForm() {
    this.limpiarFormularioMaterial();
    this.isModalRegisterMaterialesOpen = true;
  }

  closeRegisterMaterialModal() {
    this.isModalRegisterMaterialesOpen = false;
  }

  openModalToUpdateMaterial(material: any) {
    this.materialSeleccionado = { ...material };
    this.isModalUpdateMaterialesOpen = true;
  }

  closeUpdateMaterialModal() {
    this.isModalUpdateMaterialesOpen = false;
    this.materialSeleccionado = null;
  }

  limpiarFormularioMaterial() {
    this.nuevoMaterial = {
      nombre: '',
      stockActual: 0,
      unidadMedida: '',
      stockMinimo: 0,
      categoriaId: null,
      descripcion: '',
      imagen: ''
    };
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BitacoraService, RegistroBitacora } from '../../services/bitacora.service';

@Component({
  selector: 'app-bitacora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent implements OnInit {
  // Propiedades para la tabla y filtros
  registrosFiltrados: RegistroBitacora[] = [];
  filtroTexto: string = '';
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // Propiedades para la paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 10;
  totalRegistros: number = 0;
  totalPaginas: number = 0;

  // Propiedades para el ordenamiento
  ordenColumna: string = 'fecha';
  ordenAscendente: boolean = false;

  // Propiedades para el modal
  mostrarModalDetalles: boolean = false;
  registroSeleccionado: RegistroBitacora | null = null;

  // Propiedad Math para usar en el template
  Math = Math;

  constructor(private bitacoraService: BitacoraService) {}

  ngOnInit(): void {
    this.cargarRegistros();
  }

  cargarRegistros(): void {
    const filtros = {
      texto: this.filtroTexto,
      fechaDesde: this.filtroFechaDesde ? new Date(this.filtroFechaDesde) : undefined,
      fechaHasta: this.filtroFechaHasta ? new Date(this.filtroFechaHasta) : undefined,
      ordenColumna: this.ordenColumna,
      ordenAscendente: this.ordenAscendente,
      pagina: this.paginaActual,
      registrosPorPagina: this.registrosPorPagina
    };

    this.bitacoraService.getBitacora(filtros).subscribe({
      next: (response) => {
        this.registrosFiltrados = response.registros;
        this.totalRegistros = response.total;
        this.calcularTotalPaginas();
      },
      error: (error) => {
        console.error('Error al cargar la bitácora:', error);
        // Aquí podrías agregar una notificación de error para el usuario
      }
    });
  }

  ordenarPor(columna: string): void {
    if (this.ordenColumna === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenColumna = columna;
      this.ordenAscendente = true;
    }
    this.cargarRegistros();
  }

  aplicarFiltros(): void {
    this.paginaActual = 1; // Resetear a la primera página
    this.cargarRegistros();
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarRegistros();
    }
  }

  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.totalRegistros / this.registrosPorPagina);
  }

  paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  verDetalles(registro: RegistroBitacora): void {
    this.registroSeleccionado = registro;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.registroSeleccionado = null;
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.ordenColumna = 'fecha';
    this.ordenAscendente = false;
    this.paginaActual = 1;
    this.cargarRegistros();
  }

  obtenerModulo(detalles: string): string {
    if (!detalles) return 'No especificado';
    try {
      const detailsObj = JSON.parse(detalles);
      return detailsObj.modulo || 'No especificado';
    } catch {
      return 'No especificado';
    }
  }

  exportarRegistros(): void {
    const filtros = {
      texto: this.filtroTexto,
      fechaDesde: this.filtroFechaDesde ? new Date(this.filtroFechaDesde) : undefined,
      fechaHasta: this.filtroFechaHasta ? new Date(this.filtroFechaHasta) : undefined,
      ordenColumna: this.ordenColumna,
      ordenAscendente: this.ordenAscendente
    };

    this.bitacoraService.exportarBitacora(filtros).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bitacora_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al exportar la bitácora:', error);
        // Aquí podrías agregar una notificación de error para el usuario
      }
    });
  }
}

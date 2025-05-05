import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComprasService } from '../../services/compras.service';
import { MaterialesService } from '../../services/materiales.service';
import { ProveedoresService } from '../../services/proveedores.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  // Filtros para Reportes de Compras
  fechaDesdeCompras: string = '';
  fechaHastaCompras: string = '';
  proveedorSeleccionadoId: number = 0;
  estadoSeleccionado: string = '';
  
  // Filtros para Reportes de Productos
  fechaDesdeProductos: string = '';
  fechaHastaProductos: string = '';
  stockMinimo: number = 0;
  busquedaProducto: string = '';
  
  // Datos
  compras: any[] = [];
  comprasOriginal: any[] = []; // Para mantener todas las compras y poder filtrar
  materiales: any[] = [];
  materialesOriginal: any[] = []; // Para mantener todos los materiales y poder filtrar
  proveedores: any[] = [];
  
  // Estado de visualización
  reporteActivo: 'compras' | 'productos' = 'compras';
  
  // Estados disponibles para compras
  estadosCompra: string[] = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'COMPLETADO'];
  
  // Indicadores de carga
  cargandoCompras: boolean = false;
  cargandoMateriales: boolean = false;
  
  constructor(
    private comprasService: ComprasService,
    private materialesService: MaterialesService,
    private proveedoresService: ProveedoresService
  ) {}
  
  ngOnInit(): void {
    this.inicializarFechas();
    this.obtenerProveedores();
    this.obtenerCompras();
    this.obtenerMateriales();
  }
  
  inicializarFechas(): void {
    // Configurar fechas por defecto (último mes)
    const hoy = new Date();
    this.fechaHastaCompras = hoy.toISOString().split('T')[0];
    this.fechaHastaProductos = this.fechaHastaCompras;
    
    const mesAnterior = new Date();
    mesAnterior.setMonth(mesAnterior.getMonth() - 1);
    this.fechaDesdeCompras = mesAnterior.toISOString().split('T')[0];
    this.fechaDesdeProductos = this.fechaDesdeCompras;
  }
  
  obtenerProveedores(): void {
    this.proveedoresService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        console.log('Proveedores cargados:', this.proveedores); // Log para depuración
      },
      error: (error) => {
        console.error('Error al obtener proveedores:', error);
      }
    });
  }
  
  obtenerCompras(): void {
    this.cargandoCompras = true;
    this.comprasService.getCompras().subscribe({
      next: (data) => {
        this.comprasOriginal = data;
        this.compras = [...data];
        this.cargandoCompras = false;
      },
      error: (error) => {
        console.error('Error al obtener compras:', error);
        this.cargandoCompras = false;
      }
    });
  }
  
  obtenerMateriales(): void {
    this.cargandoMateriales = true;
    this.materialesService.getMaterialesCompletos().subscribe({
      next: (data) => {
        console.log('Materiales completos recibidos del backend (raw):', JSON.stringify(data.slice(0, 3)));
        
        // Procesamos los materiales para asegurar que todos los campos numéricos estén correctos
        const materialesProcesados = data.map((material, index) => {
          // Conversión explícita con verificación de valores
          const stockActual = parseFloat(String(material.stockActual || 0));
          const stockMinimo = parseFloat(String(material.stockMinimo || 0));
          const precio = parseFloat(String(material.precio || 0));
          
          // Log detallado para diagnóstico
          if (index < 3) {
            console.log(`Material #${index} (${material.id} - ${material.nombre}): ` +
                       `stockActual=[${material.stockActual}] → ${stockActual}, ` +
                       `stockMinimo=[${material.stockMinimo}] → ${stockMinimo}, ` +
                       `precio=[${material.precio}] → ${precio}`);
          }
          
          return {
            ...material,
            id: material.id || 0,
            nombre: material.nombre || 'Sin nombre',
            descripcion: material.descripcion || 'Sin descripción',
            stockActual: isNaN(stockActual) ? 0 : stockActual,
            stockMinimo: isNaN(stockMinimo) ? 0 : stockMinimo,
            precio: isNaN(precio) ? 0 : precio
          };
        });
        
        this.materialesOriginal = materialesProcesados;
        this.materiales = [...materialesProcesados];
        
        // Verificar el resultado final procesado
        if (this.materiales.length > 0) {
          console.log('Muestra de primeros 3 materiales procesados después de conversión:',
                     JSON.stringify(this.materiales.slice(0, 3)));
        }
        
        this.cargandoMateriales = false;
      },
      error: (error) => {
        console.error('Error al obtener materiales:', error);
        this.cargandoMateriales = false;
        
        // Como fallback, intentamos obtener los materiales con el método original
        this.materialesService.getMateriales().subscribe({
          next: (fallbackData) => {
            console.log('Obteniendo materiales con método fallback');
            console.log('Materiales fallback recibidos (raw):', JSON.stringify(fallbackData.slice(0, 3)));
            
            // Procesamos los materiales para asegurar que todos los campos numéricos estén correctos
            const materialesProcesados = fallbackData.map((material, index) => {
              // Conversión explícita con verificación de valores
              const stockActual = parseFloat(String(material.stockActual || 0));
              const stockMinimo = parseFloat(String(material.stockMinimo || 0));
              const precio = parseFloat(String(material.precio || 0));
              
              // Log detallado para diagnóstico
              if (index < 3) {
                console.log(`Fallback Material #${index} (${material.id} - ${material.nombre}): ` +
                           `stockActual=[${material.stockActual}] → ${stockActual}, ` +
                           `stockMinimo=[${material.stockMinimo}] → ${stockMinimo}, ` +
                           `precio=[${material.precio}] → ${precio}`);
              }
              
              return {
                ...material,
                id: material.id || 0,
                nombre: material.nombre || 'Sin nombre',
                descripcion: material.descripcion || 'Sin descripción',
                stockActual: isNaN(stockActual) ? 0 : stockActual,
                stockMinimo: isNaN(stockMinimo) ? 0 : stockMinimo,
                precio: isNaN(precio) ? 0 : precio
              };
            });
            
            this.materialesOriginal = materialesProcesados;
            this.materiales = [...materialesProcesados];
            
            // Verificar el resultado final procesado
            if (this.materiales.length > 0) {
              console.log('Muestra de primeros 3 materiales fallback procesados después de conversión:',
                         JSON.stringify(this.materiales.slice(0, 3)));
            }
            
            this.cargandoMateriales = false;
          },
          error: (fallbackError) => {
            console.error('Error al obtener materiales con método fallback:', fallbackError);
            this.cargandoMateriales = false;
          }
        });
      }
    });
  }
  
  filtrarCompras(): void {
    this.cargandoCompras = true;
    
    try {
      // Verificar que las fechas son válidas
      if (!this.fechaDesdeCompras || !this.fechaHastaCompras) {
        alert('Por favor, seleccione un rango de fechas válido');
        this.cargandoCompras = false;
        return;
      }
      
      // Convertir las cadenas de fecha a objetos Date
      // Usamos las fechas con hora específica para evitar problemas con zonas horarias
      const fechaDesde = new Date(this.fechaDesdeCompras + 'T00:00:00');
      const fechaHasta = new Date(this.fechaHastaCompras + 'T23:59:59');
      
      // Validación adicional de fechas
      if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
        alert('Por favor, seleccione un rango de fechas válido');
        this.cargandoCompras = false;
        return;
      }
      
      // Verificar que la fecha desde es anterior a la fecha hasta
      if (fechaDesde > fechaHasta) {
        alert('La fecha desde debe ser anterior a la fecha hasta');
        this.cargandoCompras = false;
        return;
      }

      console.log('Filtrando con los siguientes criterios:');
      console.log('- Fecha desde:', fechaDesde);
      console.log('- Fecha hasta:', fechaHasta);
      console.log('- Proveedor ID:', this.proveedorSeleccionadoId);
      console.log('- Estado:', this.estadoSeleccionado || 'Todos');
      
      // Filtrar compras que están dentro del rango de fechas
      this.compras = this.comprasOriginal.filter(compra => {
        try {
          // Asegurarse de que la fecha de compra sea un objeto Date
          let fechaCompra;
          if (typeof compra.fecha === 'string') {
            // Si es una cadena, asegurar que tenga un formato consistente
            // Si solo tiene fecha sin hora, añadir la hora
            if (compra.fecha.length <= 10) {
              fechaCompra = new Date(compra.fecha + 'T12:00:00');
            } else {
              fechaCompra = new Date(compra.fecha);
            }
          } else if (compra.fecha instanceof Date) {
            fechaCompra = compra.fecha;
          } else {
            // Si no es string ni Date, usar la fecha actual como fallback
            fechaCompra = new Date();
          }
          
          // Extraer solo la fecha (año, mes, día) para comparación
          const fechaCompraMs = fechaCompra.getTime();
          const fechaDesdeMs = fechaDesde.getTime();
          const fechaHastaMs = fechaHasta.getTime();
          
          // Verificar si la fecha está dentro del rango (inclusivo)
          const esEnRango = fechaCompraMs >= fechaDesdeMs && fechaCompraMs <= fechaHastaMs;
          
          return esEnRango;
        } catch (err) {
          console.error('Error al procesar fecha de compra:', err);
          return false;
        }
      });
      
      console.log('Compras después de filtrar por fecha:', this.compras.length);
      
      // Aplicar filtro adicional por proveedor si está seleccionado
      if (this.proveedorSeleccionadoId > 0) {
        console.log('Filtrando por proveedor ID:', this.proveedorSeleccionadoId);
        
        // Inspeccionar antes del filtrado
        if (this.compras.length > 0) {
          console.log('Ejemplo de estructura de compra antes de filtrar por proveedor:', 
                     JSON.stringify(this.compras[0]));
        }
        
        this.compras = this.compras.filter(compra => {
          // Manejar las diferentes estructuras posibles para el ID del proveedor
          const proveedorId = this.obtenerProveedorId(compra);
          
          console.log(`Compra ID ${compra.id || 'N/A'}: proveedor detectado = ${proveedorId}, coincide? ${proveedorId === this.proveedorSeleccionadoId}`);
          
          return proveedorId == this.proveedorSeleccionadoId; // Usar == en vez de === para permitir comparación entre string/number
        });
        
        console.log('Compras después de filtrar por proveedor:', this.compras.length);
      }
      
      // Aplicar filtro adicional por estado si está seleccionado
      if (this.estadoSeleccionado) {
        console.log('Filtrando por estado:', this.estadoSeleccionado);
        this.compras = this.compras.filter(compra => compra.estado === this.estadoSeleccionado);
        console.log('Compras después de filtrar por estado:', this.compras.length);
      }
    } catch (error) {
      console.error('Error al filtrar compras:', error);
      alert('Ocurrió un error al filtrar las compras. Por favor, intente de nuevo.');
    } finally {
      this.cargandoCompras = false;
    }
  }
  
  // Método auxiliar para obtener el ID del proveedor de una compra
  obtenerProveedorId(compra: any): number {
    try {
      // Registrar la estructura de la compra para depuración
      console.log('Extrayendo ID de proveedor de compra:', 
                 JSON.stringify({
                   compraId: compra.id,
                   proveedorId: compra.proveedorId,
                   proveedor: compra.proveedor
                 }));
      
      // Comprobar todas las posibles estructuras donde puede estar el ID del proveedor
      if (compra.proveedorId !== undefined && compra.proveedorId !== null) {
        return Number(compra.proveedorId); // Convertir a número para asegurar consistencia
      } else if (compra.proveedor) {
        if (typeof compra.proveedor === 'object') {
          if (compra.proveedor.id !== undefined) {
            return Number(compra.proveedor.id);
          }
          // Buscar campos que puedan contener el ID
          for (const key of ['id', 'proveedorId', 'proveedor_id']) {
            if (compra.proveedor[key] !== undefined) {
              return Number(compra.proveedor[key]);
            }
          }
        } else if (typeof compra.proveedor === 'number') {
          // A veces el campo proveedor puede ser directamente el ID
          return compra.proveedor;
        }
      }
      
      // Si llegamos aquí, no hemos encontrado un ID válido
      return 0;
    } catch (error) {
      console.error('Error al obtener ID de proveedor:', error);
      return 0;
    }
  }
  
  // Método auxiliar para obtener el nombre del proveedor
  obtenerNombreProveedor(compra: any): string {
    try {
      // Si la compra tiene un objeto proveedor anidado con nombre, usamos ese
      if (compra.proveedor && compra.proveedor.nombre) {
        return compra.proveedor.nombre;
      }
      
      // De lo contrario, buscamos el proveedor por su ID
      const proveedorId = this.obtenerProveedorId(compra);
      if (proveedorId > 0) {
        const proveedor = this.proveedores.find(p => p.id === proveedorId);
        if (proveedor) {
          return proveedor.nombre;
        }
      }
      
      return 'No especificado';
    } catch (error) {
      console.error('Error al obtener nombre de proveedor:', error);
      return 'No especificado';
    }
  }
  
  filtrarProductos(): void {
    this.cargandoMateriales = true;
    
    try {
      console.log('Filtrando productos con stock mínimo:', this.stockMinimo);
      console.log('Buscando producto:', this.busquedaProducto);
      console.log('Total de materiales originales:', this.materialesOriginal.length);
      
      // Verificar si hay datos en el array original
      if (this.materialesOriginal.length > 0) {
        console.log('Muestra de material original antes de filtrar:', 
                   `id=${this.materialesOriginal[0].id}, stockActual=${this.materialesOriginal[0].stockActual}, precio=${this.materialesOriginal[0].precio}`);
      }
      
      // Copia los materiales originales para comenzar el filtrado
      let materialesFiltrados = [...this.materialesOriginal];
      
      // Filtrar por búsqueda de producto (ID o nombre)
      if (this.busquedaProducto && this.busquedaProducto.trim() !== '') {
        const busqueda = this.busquedaProducto.trim().toLowerCase();
        materialesFiltrados = materialesFiltrados.filter(material => {
          const idComoString = String(material.id || '').toLowerCase();
          const nombre = (material.nombre || '').toLowerCase();
          return idComoString.includes(busqueda) || nombre.includes(busqueda);
        });
        console.log(`Filtrado por búsqueda: ${materialesFiltrados.length} resultados`);
      }
      
      // Filtramos los materiales que están por debajo del stock mínimo
      if (this.stockMinimo > 0) {
        materialesFiltrados = materialesFiltrados.filter(material => {
          // Convertir a número para asegurar una comparación adecuada
          const stockActual = parseFloat(String(material.stockActual));
          const stockMinimo = parseFloat(String(this.stockMinimo));
          const incluir = !isNaN(stockActual) && !isNaN(stockMinimo) && stockActual <= stockMinimo;
          
          // Log detallado para algunos materiales
          if (materialesFiltrados.indexOf(material) < 3) {
            console.log(`Filtro stock - Material ${material.id} - ${material.nombre}: ` +
                        `stockActual=${stockActual}, filtro=${stockMinimo}, incluido=${incluir}`);
          }
          
          return incluir;
        });
        console.log(`Filtrado por stock mínimo: ${materialesFiltrados.length} resultados`);
      }
      
      // Asignamos los resultados del filtrado
      this.materiales = materialesFiltrados;
      
      console.log('Total de materiales después del filtrado:', this.materiales.length);
      
      // Ordenar materiales por stock (de menor a mayor)
      this.materiales.sort((a, b) => {
        const stockActualA = parseFloat(String(a.stockActual)) || 0;
        const stockActualB = parseFloat(String(b.stockActual)) || 0;
        return stockActualA - stockActualB;
      });
      
      // Verificar resultado final después del filtrado
      if (this.materiales.length > 0) {
        console.log('Muestra después del filtrado:', 
                   `id=${this.materiales[0].id}, stockActual=${this.materiales[0].stockActual}, precio=${this.materiales[0].precio}`);
      }
      
    } catch (error) {
      console.error('Error al filtrar productos:', error);
      alert('Ocurrió un error al filtrar los productos. Por favor, intente de nuevo.');
    } finally {
      this.cargandoMateriales = false;
    }
  }
  
  cambiarReporte(reporte: 'compras' | 'productos'): void {
    this.reporteActivo = reporte;
  }
  
  getNombreProveedor(proveedorId: number | undefined): string {
    if (!proveedorId) {
      return 'No especificado';
    }
    
    // Buscar el proveedor por su ID
    const proveedor = this.proveedores.find(p => p.id === proveedorId);
    
    return proveedor ? proveedor.nombre : 'No especificado';
  }
  
  descargarReporteComprasPDF(): void {
    // Aquí implementarías la lógica para descargar el reporte en PDF
    alert('Funcionalidad de descarga en PDF en desarrollo...');
  }
  
  descargarReporteComprasExcel(): void {
    // Aquí implementarías la lógica para descargar el reporte en Excel
    alert('Funcionalidad de descarga en Excel en desarrollo...');
  }
  
  descargarReporteProductosPDF(): void {
    // Aquí implementarías la lógica para descargar el reporte en PDF
    alert('Funcionalidad de descarga en PDF en desarrollo...');
  }
  
  descargarReporteProductosExcel(): void {
    // Aquí implementarías la lógica para descargar el reporte en Excel
    alert('Funcionalidad de descarga en Excel en desarrollo...');
  }
  
  calcularTotalCompras(): number {
    return this.compras.reduce((sum, compra) => sum + (compra.importe_total || 0), 0);
  }
  
  // Ya no necesitamos calcular el valor del inventario, pero podemos calcular el total de stock disponible
  calcularTotalStockDisponible(): number {
    let total = 0;
    
    this.materiales.forEach((material) => {
      const stockActual = parseFloat(String(material.stockActual)) || 0;
      total += stockActual;
    });
    
    return total;
  }
  
  /**
   * Método de seguridad para asegurar que un valor sea numérico
   * @param value El valor a convertir
   * @param decimals Número de decimales (por defecto 0)
   * @returns El valor numérico o 0 si no es válido
   */
  getNumericValue(value: any, decimals: number = 0): number {
    if (value === undefined || value === null) {
      return 0;
    }
    
    // Intentar convertir a número
    const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    
    if (isNaN(num)) {
      return 0;
    }
    
    // Si se especificaron decimales, redondear
    if (decimals > 0) {
      return parseFloat(num.toFixed(decimals));
    }
    
    return num;
  }
}

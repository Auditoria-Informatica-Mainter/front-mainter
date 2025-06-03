import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { DetallePedidoService } from '../../services/detalle-pedido.service';
import { MetodoPagoService } from '../../services/metodo-pago.service';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { Pedido, PedidoDTO, DetallePedido, DetallePedidoDTO, MetodoPago } from '../../models/pedido.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  metodosPago: MetodoPago[] = [];
  productos: any[] = [];
  mostrarFormulario = false;
  modoEdicion = false;
  pedidoForm: FormGroup;
  pedidoEditando: Pedido | null = null;
  cargando = false;
  mostrarDetalle = false;
  pedidoDetalle: Pedido | null = null;
  // Filtros
  filtroEstado: string = 'todos';
  terminoBusqueda: string = '';
  pedidosFiltrados: Pedido[] = [];
  constructor(
    private pedidoService: PedidoService,
    private detallePedidoService: DetallePedidoService,
    private metodoPagoService: MetodoPagoService,
    private productoService: ProductoService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router  ) {this.pedidoForm = this.formBuilder.group({
      fecha: ['', [Validators.required]],
      descripcion: [''],
      importe_total: [0, [Validators.required, Validators.min(0)]],
      importe_total_desc: [0, [Validators.min(0)]],
      estado: [true],
      metodo_pago_id: ['', [Validators.required]],
      detalle_pedidos: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  get detallesPedidos(): FormArray {
    return this.pedidoForm.get('detalle_pedidos') as FormArray;
  }

  cargarDatos(): void {
    this.cargando = true;
    Promise.all([
      this.cargarPedidos(),
      this.cargarMetodosPago(),
      this.cargarProductos()
    ]).finally(() => {
      this.cargando = false;
    });
  }
  cargarPedidos(): Promise<void> {
    return new Promise((resolve) => {
      this.pedidoService.listarPedidos().subscribe({
        next: (response) => {
          this.pedidos = response.data;
          this.filtrarPedidos(); // Aplicar filtros después de cargar
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar pedidos:', error);
          Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
          resolve();
        }
      });
    });
  }

  cargarMetodosPago(): Promise<void> {
    return new Promise((resolve) => {
      this.metodoPagoService.listarMetodosPago().subscribe({
        next: (response) => {
          this.metodosPago = response.data;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar métodos de pago:', error);
          resolve();
        }
      });
    });
  }
  cargarProductos(): Promise<void> {
    return new Promise((resolve) => {
      this.productoService.getProductos().subscribe({
        next: (response: any) => {
          this.productos = response.data || response;
          resolve();
        },
        error: (error: any) => {
          console.error('Error al cargar productos:', error);
          resolve();
        }
      });
    });
  }
  filtrarPedidos(): void {
    let pedidosFiltrados = this.pedidos;

    // Filtrar por estado
    if (this.filtroEstado !== 'todos') {
      const estado = this.filtroEstado === 'activos';
      pedidosFiltrados = pedidosFiltrados.filter(pedido => pedido.estado === estado);
    }

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      pedidosFiltrados = pedidosFiltrados.filter(pedido =>
        (pedido.id?.toString() || '').includes(termino) ||
        (pedido.metodo_pago?.nombre?.toLowerCase() || '').includes(termino) ||
        pedido.fecha.includes(termino)
      );
    }

    this.pedidosFiltrados = pedidosFiltrados;
  }
  abrirFormularioCrear(): void {
    // Crear pedido inmediatamente en la base de datos
    this.crearPedidoVacio();
  }

  crearPedidoVacio(): void {
    this.cargando = true;
      const pedidoDTO: PedidoDTO = {
      fecha: new Date().toISOString().split('T')[0],
      descripcion: 'Pedido creado automáticamente',
      importe_total: 0,
      importe_total_desc: 0,
      estado: false, // Pendiente por defecto
      usuario_id: this.authService.obtenerUsuarioId(),
      metodo_pago_id: 1 // Valor por defecto, se puede cambiar después
    };

    this.pedidoService.crearPedido(pedidoDTO).subscribe({
      next: (response) => {
        console.log('Pedido vacío creado:', response);
        if (response.data?.id) {
          // Cargar el pedido recién creado para edición
          this.abrirFormularioEditar(response.data);
          this.modoEdicion = false; // Cambiar a modo creación para el formulario
          this.cargando = false;
        } else {
          this.cargando = false;
          Swal.fire('Error', 'No se pudo crear el pedido correctamente', 'error');
        }
      },
      error: (error) => {
        console.error('Error al crear pedido vacío:', error);
        this.cargando = false;
        Swal.fire('Error', 'No se pudo crear el pedido: ' + (error.error?.message || 'Error desconocido'), 'error');
      }
    });
  }

  abrirFormularioEditar(pedido: Pedido): void {
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.pedidoEditando = pedido;      this.pedidoForm.patchValue({
      fecha: pedido.fecha.split('T')[0],
      descripcion: pedido.descripcion || '',
      importe_total: pedido.importe_total,
      importe_total_desc: pedido.importe_total_desc,
      estado: pedido.estado,
      metodo_pago_id: pedido.metodo_pago?.id
    });// Cargar detalles del pedido
    this.detallesPedidos.clear();    if (pedido.detalle_pedidos && pedido.detalle_pedidos.length > 0) {
      pedido.detalle_pedidos.forEach(detalle => {
        const detalleFormGroup = this.formBuilder.group({
          id: [detalle.id], // ✅ Incluir el ID del detalle
          cantidad: [detalle.cantidad, [Validators.required, Validators.min(1)]],
          precio: [detalle.precioUnitario, [Validators.required, Validators.min(0)]],
          importe: [detalle.importe_total, [Validators.required, Validators.min(0)]],
          importe_Desc: [detalle.importe_total_desc, [Validators.min(0)]],
          estado: [detalle.estado],
          producto_id: [detalle.producto?.id, [Validators.required]]
        });

        // ✅ Agregar listeners para cálculos automáticos también en detalles existentes
        detalleFormGroup.get('cantidad')?.valueChanges.subscribe(() => this.calcularImporte(detalleFormGroup));
        detalleFormGroup.get('precio')?.valueChanges.subscribe(() => this.calcularImporte(detalleFormGroup));

        // ✅ Escuchar cambios en producto_id para auto-poblar precio
        detalleFormGroup.get('producto_id')?.valueChanges.subscribe((productoId) => {
          if (productoId) {
            this.autoLlenarPrecioProducto(detalleFormGroup, parseInt(productoId.toString()));
          }
        });

        this.detallesPedidos.push(detalleFormGroup);
      });
    } else {
      this.agregarDetalle();
    }
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.pedidoForm.reset();
    this.pedidoEditando = null;
    this.detallesPedidos.clear();
  }  agregarDetalle(): void {
    const detalle = this.formBuilder.group({
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      importe: [0, [Validators.required, Validators.min(0)]],
      importe_Desc: [0, [Validators.min(0)]],
      estado: [true],
      producto_id: ['', [Validators.required]]
    });

    // Escuchar cambios en cantidad y precio para calcular importe
    detalle.get('cantidad')?.valueChanges.subscribe(() => this.calcularImporte(detalle));
    detalle.get('precio')?.valueChanges.subscribe(() => this.calcularImporte(detalle));

    // Escuchar cambios en producto_id para auto-poblar precio
    detalle.get('producto_id')?.valueChanges.subscribe((productoId) => {
      if (productoId) {
        this.autoLlenarPrecioProducto(detalle, parseInt(productoId.toString()));
      }
    });

    this.detallesPedidos.push(detalle);
  }  // Método auxiliar para el template
  agregarDetalleAlBackendFromIndex(index: number): void {
    const detalleControl = this.detallesPedidos.at(index) as FormGroup;
    this.agregarDetalleAlBackend(detalleControl);
  }  // Nuevo método para agregar detalle directamente al backend
  agregarDetalleAlBackend(detalleForm: FormGroup): void {
    if (!this.pedidoEditando?.id) {
      Swal.fire('Error', 'Debe tener un pedido activo para agregar detalles', 'warning');
      return;
    }

    if (!detalleForm.valid) {
      Swal.fire('Error', 'Por favor complete todos los campos del detalle', 'warning');
      return;
    }

    const detalleValue = detalleForm.value;
    console.log('🔍 Valores del formulario de detalle:', detalleValue);

    // 🔍 Validar datos antes de enviar
    if (!detalleValue.producto_id || detalleValue.producto_id <= 0) {
      Swal.fire('Error', 'Debe seleccionar un producto válido', 'warning');
      return;
    }

    if (!detalleValue.cantidad || detalleValue.cantidad <= 0) {
      Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'warning');
      return;
    }

    // 🔍 Obtener precio correcto desde el formulario
    const precio = Number(detalleValue.precio) || 0;
    const cantidad = Number(detalleValue.cantidad) || 0;
    const importe = cantidad * precio;

    // 🔧 Asegurar que los tipos de datos sean correctos
    const detalleDTO: DetallePedidoDTO = {
      cantidad: cantidad,
      importe_Total: importe,
      importe_Total_Desc: Number(detalleValue.importe_Desc) || 0,
      precioUnitario: precio,
      productoId: Number(detalleValue.producto_id),
      pedidoId: Number(this.pedidoEditando.id)
    };

    console.log('🚀 Enviando DTO de detalle al servicio:', detalleDTO);
    console.log('📍 Pedido ID:', this.pedidoEditando.id);
    console.log('📍 Producto ID:', detalleValue.producto_id);
    console.log('📍 Cantidad:', cantidad);
    console.log('📍 Precio:', precio);
    console.log('📍 Importe calculado:', importe);

    this.cargando = true;
    this.detallePedidoService.crearDetalle(detalleDTO).subscribe({
      next: (response) => {
        console.log('✅ Detalle creado - Respuesta completa:', response);
        console.log('✅ Datos del detalle creado:', response.data);
        console.log('✅ Estado de la respuesta:', response.statusCode);

        if (response.statusCode === 200 || response.statusCode === 201) {
          Swal.fire('Éxito', 'Detalle agregado correctamente', 'success');
          // Recargar el pedido para obtener los totales actualizados
          this.recargarPedidoActual();
          this.cargarPedidos(); // Actualizar la lista principal
        } else {
          console.warn('⚠️ Respuesta inesperada del servidor:', response);
          Swal.fire('Advertencia', 'El detalle se procesó pero hubo una respuesta inesperada', 'warning');
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al crear detalle - Detalle del error:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error message:', error.error?.message || 'Sin mensaje');
        console.error('❌ Error details:', error.error);

        this.cargando = false;
        const errorMessage = error.error?.message || error.message || 'Error desconocido';
        Swal.fire('Error', `Error al agregar detalle: ${errorMessage}`, 'error');
      }
    });
  }

  eliminarDetalle(index: number): void {
    const detalleControl = this.detallesPedidos.at(index);
    const detalleId = detalleControl.get('id')?.value;

    if (detalleId && this.pedidoEditando?.id) {
      // Si el detalle ya existe en el backend, eliminarlo de la base de datos
      Swal.fire({
        title: '¿Está seguro?',
        text: 'Este detalle será eliminado permanentemente',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cargando = true;
          this.detallePedidoService.eliminarDetalle(detalleId).subscribe({
            next: (response) => {
              Swal.fire('Eliminado', 'El detalle ha sido eliminado', 'success');
              this.recargarPedidoActual(); // Recargar datos del backend
              this.cargarPedidos(); // Actualizar lista principal
              this.cargando = false;
            },
            error: (error) => {
              console.error('Error al eliminar detalle:', error);
              this.cargando = false;
              Swal.fire('Error', 'No se pudo eliminar el detalle', 'error');
            }
          });
        }
      });
    } else {
      // Si es un detalle nuevo (sin ID), solo eliminarlo del formulario
      this.detallesPedidos.removeAt(index);
      if (this.detallesPedidos.length === 0) {
        this.agregarDetalle(); // Asegurar que siempre haya al menos una línea
      }
    }
  }

  calcularImporte(detalle: FormGroup): void {
    const cantidad = detalle.get('cantidad')?.value || 0;
    const precio = detalle.get('precio')?.value || 0;
    const importe = cantidad * precio;
    detalle.get('importe')?.setValue(importe, { emitEvent: false });
    this.calcularTotales();
  }
  calcularTotales(): void {
    let total = 0;
    this.detallesPedidos.controls.forEach(detalle => {    total += detalle.get('importe')?.value || 0;
    });
    this.pedidoForm.get('importe_total')?.setValue(total, { emitEvent: false });
  }

  autoLlenarPrecioProducto(detalle: FormGroup, productoId: number): void {
    const producto = this.productos.find(p => p.id === parseInt(productoId.toString()));
    if (producto && producto.precioUnitario) {
      detalle.get('precio')?.setValue(producto.precioUnitario, { emitEvent: true });
    }
  }  guardarPedido(): void {
    if (this.pedidoForm.valid) {
      // Validación adicional para metodo_pago_id
      const metodoPagoId = this.pedidoForm.get('metodo_pago_id')?.value;
      if (!metodoPagoId || metodoPagoId === '') {
        Swal.fire('Error', 'Debe seleccionar un método de pago', 'warning');
        return;
      }

      this.cargando = true;
      const formValue = this.pedidoForm.value;

      const pedidoDTO: PedidoDTO = {
        fecha: formValue.fecha,
        descripcion: formValue.descripcion || '',
        importe_total: formValue.importe_total,
        importe_total_desc: formValue.importe_total_desc || 0,
        estado: formValue.estado,
        usuario_id: this.authService.obtenerUsuarioId(),
        metodo_pago_id: parseInt(metodoPagoId) // Asegurar que sea número
      };

      if (this.pedidoEditando?.id) {
        // Actualizar la información del pedido
        this.pedidoService.actualizarPedido(this.pedidoEditando.id, pedidoDTO).subscribe({
          next: (response) => {
            console.log('✅ Pedido actualizado correctamente');

            // 🔥 NUEVO: Procesar todos los detalles del formulario automáticamente
            this.procesarTodosLosDetalles().then(() => {
              Swal.fire('Éxito', 'Pedido y todos los detalles guardados correctamente', 'success');
              this.cargarPedidos();
              this.cerrarFormulario();
              this.cargando = false;
            }).catch((error) => {
              console.error('Error al procesar detalles:', error);
              Swal.fire('Advertencia', 'El pedido se guardó pero hubo problemas con algunos detalles', 'warning');
              this.cargarPedidos();
              this.cargando = false;
            });
          },
          error: (error) => {
            console.error('Error al actualizar pedido:', error);
            Swal.fire('Error', 'No se pudo actualizar el pedido', 'error');
            this.cargando = false;
          }
        });
      } else {
        // Si no hay pedido editando, significa que algo salió mal
        Swal.fire('Error', 'No hay un pedido activo para guardar', 'error');
        this.cargando = false;
      }
    } else {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos', 'warning');
    }  }

  // 🔥 NUEVO MÉTODO: Procesar todos los detalles del formulario automáticamente
  private async procesarTodosLosDetalles(): Promise<void> {
    console.log('🔄 Iniciando procesamiento automático de todos los detalles...');

    const detallesArray = this.obtenerArrayDetalles();
    if (!detallesArray || detallesArray.length === 0) {
      console.log('⚠️ No hay detalles para procesar');
      return;
    }

    console.log(`📊 Procesando ${detallesArray.length} detalles automáticamente:`);

    const promesas = [];

    for (let i = 0; i < detallesArray.length; i++) {
      const detalle = detallesArray.at(i);

      if (detalle && detalle.value) {
        const detalleValue = detalle.value;

        // Validar que tenga datos mínimos
        if (detalleValue.producto_id && detalleValue.cantidad > 0) {
          console.log(`📝 Procesando detalle ${i + 1}:`, detalleValue);

          const promesa = this.procesarDetalleIndividual(detalleValue, i);
          promesas.push(promesa);
        } else {
          console.log(`⚠️ Detalle ${i + 1} omitido (datos incompletos):`, detalleValue);
        }
      }
    }

    if (promesas.length > 0) {
      try {
        await Promise.all(promesas);
        console.log('✅ Todos los detalles procesados correctamente');
      } catch (error) {
        console.error('❌ Error al procesar algunos detalles:', error);
        throw error;
      }
    } else {
      console.log('⚠️ No se encontraron detalles válidos para procesar');
    }
  }

  private procesarDetalleIndividual(detalleValue: any, index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const detalleFinal = {
        productoId: detalleValue.producto_id,
        pedidoId: this.pedidoEditando!.id!,
        cantidad: detalleValue.cantidad,
        importe_Total: detalleValue.importe || 0,
        importe_Total_Desc: detalleValue.importe_Desc || 0,
        precioUnitario: detalleValue.precio || 0
      };

      console.log(`🚀 Enviando detalle ${index + 1} al backend:`, detalleFinal);

      this.detallePedidoService.crearDetalle(detalleFinal).subscribe({
        next: (response) => {
          console.log(`✅ Detalle ${index + 1} guardado exitosamente:`, response);
          resolve();
        },
        error: (error: any) => {
          console.error(`❌ Error al guardar detalle ${index + 1}:`, error);
          reject(error);
        }
      });
    });
  }

  // Método auxiliar para obtener el array de detalles
  private obtenerArrayDetalles(): any[] {
    return this.detallesPedidos.controls;
  }

  crearDetallesPedido(pedidoId: number, detalles: DetallePedidoDTO[]): void {
    let detallesCreados = 0;
    const totalDetalles = detalles.length;

    detalles.forEach((detalle, index) => {
      // Agregar el ID del pedido al detalle
      const detalleConPedido = {
        ...detalle,
        pedidoId: pedidoId
      };      this.detallePedidoService.crearDetalle(detalleConPedido).subscribe({
        next: (detalleResponse: any) => {
          console.log(`Detalle ${index + 1} creado:`, detalleResponse);
          detallesCreados++;

          // Si se han creado todos los detalles
          if (detallesCreados === totalDetalles) {
            this.cargando = false;
            Swal.fire('Éxito', 'Pedido y detalles creados correctamente', 'success');
            this.cargarPedidos();
            this.cerrarFormulario();
          }
        },
        error: (error: any) => {
          console.error(`Error al crear detalle ${index + 1}:`, error);
          this.cargando = false;
          Swal.fire('Error', `Error al crear detalle ${index + 1}: ${error.error?.message || 'Error desconocido'}`, 'error');
        }
      });
    });
  }

  eliminarPedido(pedido: Pedido): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el pedido #${pedido.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && pedido.id) {
        this.cargando = true;
        this.pedidoService.eliminarPedido(pedido.id).subscribe({
          next: (response) => {
            Swal.fire('Eliminado', 'El pedido ha sido eliminado', 'success');
            this.cargarPedidos();
            this.cargando = false;
          },
          error: (error) => {
            console.error('Error al eliminar pedido:', error);
            Swal.fire('Error', 'No se pudo eliminar el pedido', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }
  verDetalle(pedido: Pedido): void {
    this.pedidoDetalle = pedido;
    this.mostrarDetalle = true;

    // ✅ Cargar los detalles completos desde el backend
    this.cargarDetallesCompletos(pedido.id!);
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.pedidoDetalle = null;
  }
  obtenerNombreProducto(productoId: number | undefined): string {
    if (!productoId) return 'Producto no especificado';

    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.nombre : `Producto ID: ${productoId}`;
  }
  obtenerNombreMetodoPago(metodoId: number | undefined): string {
    if (!metodoId) return 'N/A';
    const metodo = this.metodosPago.find(m => m.id === metodoId);
    return metodo ? metodo.nombre : 'Método no encontrado';
  }

  obtenerNombreMetodoPagoPedido(pedido: Pedido): string {
    if (pedido.metodo_pago?.nombre) {
      return pedido.metodo_pago.nombre;
    }
    if (pedido.metodo_pago?.id) {
      return this.obtenerNombreMetodoPago(pedido.metodo_pago.id);
    }
    return 'N/A';
  }

  cambiarEstadoPedido(pedido: Pedido): void {
    const nuevoEstado = !pedido.estado;
    const mensajeAccion = nuevoEstado ? 'marcar como pagado' : 'marcar como pendiente';
    const mensajeConfirmacion = nuevoEstado ? 'El pedido será marcado como PAGADO' : 'El pedido será marcado como PENDIENTE';

    Swal.fire({
      title: '¿Está seguro?',
      text: mensajeConfirmacion,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: nuevoEstado ? '#10b981' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${mensajeAccion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && pedido.id) {
        this.cargando = true;
          // Crear DTO con el nuevo estado
        const pedidoDTO: PedidoDTO = {
          fecha: pedido.fecha,
          descripcion: pedido.descripcion || '',
          importe_total: pedido.importe_total,
          importe_total_desc: pedido.importe_total_desc,
          estado: nuevoEstado,
          usuario_id: this.authService.obtenerUsuarioId(),
          metodo_pago_id: pedido.metodo_pago?.id || 0
        };this.pedidoService.actualizarPedido(pedido.id, pedidoDTO).subscribe({
          next: (response) => {
            // ✅ Después de actualizar el pedido, actualizar todos los detalles
            this.actualizarEstadoTodosLosDetalles(pedido.id!, nuevoEstado).then(() => {
              const estadoTexto = nuevoEstado ? 'pagado' : 'pendiente';
              Swal.fire('Éxito', `El pedido y todos sus productos han sido marcados como ${estadoTexto}`, 'success');
              this.cargarPedidos();
              this.cargando = false;            }).catch((error: any) => {
              console.error('Error al actualizar detalles:', error);
              Swal.fire('Advertencia', 'El pedido se actualizó pero hubo un problema actualizando algunos productos', 'warning');
              this.cargarPedidos();
              this.cargando = false;
            });
          },
          error: (error) => {
            console.error('Error al cambiar estado del pedido:', error);
            Swal.fire('Error', 'No se pudo cambiar el estado del pedido', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  // Método para actualizar el estado de todos los detalles de un pedido
  async actualizarEstadoTodosLosDetalles(pedidoId: number, nuevoEstado: boolean): Promise<void> {
    try {
      // Obtener todos los detalles del pedido
      const responseDetalles = await this.detallePedidoService.obtenerPorPedido(pedidoId).toPromise();

      if (responseDetalles?.data && responseDetalles.data.length > 0) {
        // Actualizar el estado de cada detalle
        const promesasActualizacion = responseDetalles.data.map(detalle => {
          if (detalle.id) {
            return this.detallePedidoService.actualizarDetalleEstado(detalle.id, nuevoEstado).toPromise();
          }
          return Promise.resolve();
        });

        // Esperar a que todas las actualizaciones terminen
        await Promise.all(promesasActualizacion);
        console.log(`Estados de ${responseDetalles.data.length} detalles actualizados correctamente`);
      }
    } catch (error) {
      console.error('Error al actualizar estados de detalles:', error);
      throw error;
    }
  }

  recargarPedidoActual(): void {
    if (this.pedidoEditando?.id) {
      this.pedidoService.obtenerPedido(this.pedidoEditando.id).subscribe({
        next: (response) => {
          this.pedidoEditando = response.data;
          // Actualizar el formulario con los nuevos totales
          this.pedidoForm.patchValue({
            importe_total: this.pedidoEditando.importe_total,
            importe_total_desc: this.pedidoEditando.importe_total_desc
          });
          // Recargar los detalles
          this.cargarDetallesPedido();
        },
        error: (error) => {
          console.error('Error al recargar pedido:', error);
        }
      });
    }
  }  cargarDetallesPedido(): void {
    if (this.pedidoEditando?.id) {
      console.log('Cargando detalles del pedido ID:', this.pedidoEditando.id);
      this.detallePedidoService.obtenerPorPedido(this.pedidoEditando.id).subscribe({
        next: (response) => {
          console.log('Respuesta de detalles del pedido:', response);
          console.log('Cantidad de detalles recibidos:', response.data ? response.data.length : 0);

          this.detallesPedidos.clear();
          if (response.data && response.data.length > 0) {
            console.log('Detalles encontrados, procesando...');
            response.data.forEach(detalle => {
              console.log('Procesando detalle:', detalle);
              const detalleFormGroup = this.formBuilder.group({
                id: [detalle.id],
                cantidad: [detalle.cantidad, [Validators.required, Validators.min(1)]],
                precio: [detalle.precioUnitario, [Validators.required, Validators.min(0)]],
                importe: [detalle.importe_total, [Validators.required, Validators.min(0)]],
                importe_Desc: [detalle.importe_total_desc, [Validators.min(0)]],
                estado: [detalle.estado],
                producto_id: [detalle.producto?.id, [Validators.required]]
              });

              // ✅ Agregar listeners para cálculos automáticos
              detalleFormGroup.get('cantidad')?.valueChanges.subscribe(() => this.calcularImporte(detalleFormGroup));
              detalleFormGroup.get('precio')?.valueChanges.subscribe(() => this.calcularImporte(detalleFormGroup));

              // ✅ Escuchar cambios en producto_id para auto-poblar precio
              detalleFormGroup.get('producto_id')?.valueChanges.subscribe((productoId) => {
                if (productoId) {
                  this.autoLlenarPrecioProducto(detalleFormGroup, parseInt(productoId.toString()));
                }
              });

              this.detallesPedidos.push(detalleFormGroup);
            });
          }
        },
        error: (error) => {
          console.error('Error al cargar detalles del pedido:', error);
        }
      });
    }
  }// Método para cargar detalles completos del pedido para el modal
  cargarDetallesCompletos(pedidoId: number): void {
    this.cargando = true;

    // ✅ Usar el nuevo endpoint que devuelve productos completos
    this.pedidoService.obtenerProductosPedido(pedidoId).subscribe({
      next: (response) => {
        if (response.data && this.pedidoDetalle) {
          // ✅ Mapear la nueva estructura de datos del backend
          this.pedidoDetalle.detalle_pedidos = response.data.map(item => ({            id: item.detalleId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            importe_total: item.importe_total,
            importe_total_desc: item.importe_total_desc,
            estado: item.estado,
            producto: {
              id: item.productoId,
              nombre: item.nombreProducto,
              descripcion: item.descripcionProducto,
              imagen: item.imagenProducto,
              tiempoProduccion: item.tiempoProduccion,
              stockDisponible: item.stockDisponible,
              stockMinimo: item.stockMinimo,
              precioUnitario: item.precioUnitario,
              categoria: item.categoriaId ? {
                id: item.categoriaId,
                nombre: item.nombreCategoria
              } : null
            }
          }));
          console.log('Detalles con productos completos cargados:', this.pedidoDetalle.detalle_pedidos);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles completos:', error);
        this.cargando = false;

        // ✅ Fallback: si el nuevo endpoint falla, usar el método anterior
        console.log('Intentando con el método anterior...');
        this.detallePedidoService.obtenerPorPedido(pedidoId).subscribe({
          next: (response) => {
            if (response.data && this.pedidoDetalle) {
              // Usar el método anterior con búsqueda manual de productos
              this.pedidoDetalle.detalle_pedidos = response.data.map(detalle => ({
                ...detalle,
                producto: this.buscarProductoPorDetalle(detalle)
              }));
              console.log('Detalles cargados con método fallback:', this.pedidoDetalle.detalle_pedidos);
            }
            this.cargando = false;
          },
          error: (fallbackError) => {
            console.error('Error en método fallback:', fallbackError);
            this.cargando = false;
            Swal.fire('Error', 'No se pudieron cargar los detalles del pedido', 'error');
          }
        });
      }
    });
  }

  // Método auxiliar para buscar producto en la lista local
  private buscarProductoPorDetalle(detalle: any): any {
    // Si el detalle tiene producto_id (como campo separado)
    if (detalle.producto_id) {
      return this.productos.find(p => p.id === detalle.producto_id);
    }

    // Si el detalle tiene la estructura del backend con producto.id
    if (detalle.producto?.id) {
      return this.productos.find(p => p.id === detalle.producto.id);
    }

    // Buscar por ID si viene como campo directo
    const productoId = detalle.productoId || detalle.producto_id;
    if (productoId) {
      return this.productos.find(p => p.id === productoId);
    }

    return null;
  }
}

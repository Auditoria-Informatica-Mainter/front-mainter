import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { DetallePedidoService } from '../../services/detalle-pedido.service';
import { MetodoPagoService } from '../../services/metodo-pago.service';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';
import { StripeService, StripeCheckoutRequest } from '../../services/stripe.service';
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
    // Tipo de cambio USD a BOB (Bolivianos bolivianos)
  tipoCambioUSDaBOB: number = 6.94; // Actualizable según el tipo de cambio actual

  constructor(
    private pedidoService: PedidoService,
    private detallePedidoService: DetallePedidoService,
    private metodoPagoService: MetodoPagoService,
    private productoService: ProductoService,
    private authService: AuthService,
    private stripeService: StripeService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {this.pedidoForm = this.formBuilder.group({
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

    // ✅ NUEVO: Verificar si hay parámetros de Stripe en la URL
    this.verificarRetornoDeStripe();
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
  }  abrirFormularioCrear(): void {
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.pedidoEditando = null;
    this.pedidoForm.reset();

    // Configurar fecha actual
    const fechaActual = new Date().toISOString().split('T')[0];
    this.pedidoForm.patchValue({
      fecha: fechaActual,
      estado: false,
      importe_total: 0,
      importe_total_desc: 0
    });

    // Limpiar detalles
    this.detallesPedidos.clear();
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.modoEdicion = false;
    this.pedidoEditando = null;
    this.pedidoForm.reset();
    this.detallesPedidos.clear();
  }

  // ✅ MÉTODOS PARA MANEJO DE PEDIDOS

  // Obtener nombre del método de pago
  obtenerNombreMetodoPagoPedido(pedido: Pedido): string {
    return pedido.metodo_pago?.nombre || 'Sin método de pago';
  }

  // Ver detalle del pedido
  verDetalle(pedido: Pedido): void {
    this.pedidoDetalle = pedido;
    this.mostrarDetalle = true;
  }

  // Cerrar detalle
  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.pedidoDetalle = null;
  }

  // Cambiar estado del pedido (Pagado/Pendiente)
  cambiarEstadoPedido(pedido: Pedido): void {
    if (!pedido.id) return;

    const nuevoEstado = !pedido.estado;
    const mensaje = nuevoEstado ? 'marcar como pagado' : 'marcar como pendiente';

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${mensaje} este pedido?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.cambiarEstadoPedido(pedido.id!, nuevoEstado).subscribe({
          next: (response) => {
            pedido.estado = nuevoEstado;
            Swal.fire(
              '¡Actualizado!',
              `El pedido ha sido ${nuevoEstado ? 'marcado como pagado' : 'marcado como pendiente'}.`,
              'success'
            );
          },
          error: (error) => {
            console.error('Error al cambiar estado:', error);
            Swal.fire('Error', 'No se pudo actualizar el estado del pedido', 'error');
          }
        });
      }
    });
  }

  // Abrir formulario de edición
  abrirFormularioEditar(pedido: Pedido): void {
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.pedidoEditando = pedido;

    // Cargar datos del pedido en el formulario
    this.pedidoForm.patchValue({
      fecha: pedido.fecha,
      descripcion: pedido.descripcion || '',
      importe_total: pedido.importe_total,
      importe_total_desc: pedido.importe_total_desc || 0,
      estado: pedido.estado,
      metodo_pago_id: pedido.metodo_pago?.id || ''
    });

    // Cargar detalles del pedido
    this.cargarDetallesPedido(pedido.id!);
  }
  // Cargar detalles del pedido para edición
  private cargarDetallesPedido(pedidoId: number): void {
    this.detallePedidoService.obtenerPorPedido(pedidoId).subscribe({
      next: (response: any) => {
        this.detallesPedidos.clear();
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((detalle: any) => {
            this.detallesPedidos.push(this.formBuilder.group({
              id: [detalle.id],
              producto_id: [detalle.producto?.id || '', [Validators.required]],
              cantidad: [detalle.cantidad, [Validators.required, Validators.min(1)]],
              precio_unitario: [detalle.precioUnitario, [Validators.required, Validators.min(0)]],
              subtotal: [detalle.importe_total, [Validators.required, Validators.min(0)]]
            }));
          });
        }
      },
      error: (error: any) => {
        console.error('Error al cargar detalles:', error);
        Swal.fire('Error', 'No se pudieron cargar los detalles del pedido', 'error');
      }
    });
  }

  // Eliminar pedido
  eliminarPedido(pedido: Pedido): void {
    if (!pedido.id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pedidoService.eliminarPedido(pedido.id!).subscribe({
          next: (response) => {
            this.cargarPedidos();
            Swal.fire('¡Eliminado!', 'El pedido ha sido eliminado.', 'success');
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            Swal.fire('Error', 'No se pudo eliminar el pedido', 'error');
          }
        });
      }
    });
  }

  // Guardar pedido (crear o actualizar)
  guardarPedido(): void {
    if (this.pedidoForm.valid) {
      this.cargando = true;
      const formData = this.pedidoForm.value;

      // Calcular importe total
      const importeTotal = this.calcularImporteTotal();
      formData.importe_total = importeTotal;      const pedidoData: PedidoDTO = {
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        importe_total: formData.importe_total,
        importe_total_desc: formData.importe_total_desc || 0,
        estado: formData.estado,
        metodo_pago_id: parseInt(formData.metodo_pago_id)
      };

      if (this.modoEdicion && this.pedidoEditando?.id) {
        // Actualizar pedido existente
        this.pedidoService.actualizarPedido(this.pedidoEditando.id, pedidoData).subscribe({
          next: (response) => {
            this.cargarPedidos();
            this.cerrarFormulario();
            this.cargando = false;
            Swal.fire('¡Éxito!', 'Pedido actualizado correctamente', 'success');
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            this.cargando = false;
            Swal.fire('Error', 'No se pudo actualizar el pedido', 'error');
          }
        });
      } else {
        // Crear nuevo pedido
        this.pedidoService.crearPedido(pedidoData).subscribe({
          next: (response) => {
            this.cargarPedidos();
            this.cerrarFormulario();
            this.cargando = false;
            Swal.fire('¡Éxito!', 'Pedido creado correctamente', 'success');
          },
          error: (error) => {
            console.error('Error al crear:', error);
            this.cargando = false;
            Swal.fire('Error', 'No se pudo crear el pedido', 'error');
          }
        });
      }
    } else {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
    }
  }

  // Agregar detalle al formulario
  agregarDetalle(): void {
    const detalleGroup = this.formBuilder.group({
      id: [null],
      producto_id: ['', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio_unitario: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0, [Validators.required, Validators.min(0)]]
    });

    // Suscribirse a cambios para calcular subtotal automáticamente
    detalleGroup.get('cantidad')?.valueChanges.subscribe(() => this.calcularSubtotal(detalleGroup));
    detalleGroup.get('precio_unitario')?.valueChanges.subscribe(() => this.calcularSubtotal(detalleGroup));

    this.detallesPedidos.push(detalleGroup);
  }

  // Eliminar detalle del formulario
  eliminarDetalle(index: number): void {
    this.detallesPedidos.removeAt(index);
    this.actualizarImporteTotal();
  }
  // Agregar detalle al backend desde el índice
  agregarDetalleAlBackendFromIndex(index: number): void {
    const detalle = this.detallesPedidos.at(index);
    if (detalle.valid && this.pedidoEditando?.id) {
      const detalleData: DetallePedidoDTO = {
        pedidoId: this.pedidoEditando.id,
        productoId: parseInt(detalle.value.producto_id),
        cantidad: detalle.value.cantidad,
        precioUnitario: detalle.value.precio_unitario,
        importe_Total: detalle.value.cantidad * detalle.value.precio_unitario,
        importe_Total_Desc: 0
      };

      this.detallePedidoService.crearDetalle(detalleData).subscribe({
        next: (response: any) => {
          detalle.patchValue({ id: response.data.id });
          Swal.fire('¡Éxito!', 'Detalle agregado correctamente', 'success');
          this.cargarPedidos(); // Recargar para actualizar totales
        },
        error: (error: any) => {
          console.error('Error al agregar detalle:', error);
          Swal.fire('Error', 'No se pudo agregar el detalle', 'error');
        }
      });
    }
  }

  // Obtener nombre del producto
  obtenerNombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto?.nombre || 'Producto no encontrado';
  }

  // Calcular subtotal de un detalle
  private calcularSubtotal(detalleGroup: FormGroup): void {
    const cantidad = detalleGroup.get('cantidad')?.value || 0;
    const precioUnitario = detalleGroup.get('precio_unitario')?.value || 0;
    const subtotal = cantidad * precioUnitario;
    detalleGroup.get('subtotal')?.setValue(subtotal, { emitEvent: false });
    this.actualizarImporteTotal();
  }

  // Actualizar importe total del pedido
  private actualizarImporteTotal(): void {
    const total = this.calcularImporteTotal();
    this.pedidoForm.get('importe_total')?.setValue(total, { emitEvent: false });
  }

  // Calcular importe total
  private calcularImporteTotal(): number {
    return this.detallesPedidos.controls.reduce((total, detalle) => {
      return total + (detalle.get('subtotal')?.value || 0);
    }, 0);
  }

  // ✅ MÉTODOS PARA STRIPE

  // Procesar pago con Stripe
  pagarConStripe(pedido: Pedido): void {
    if (!pedido.id) {
      Swal.fire('Error', 'Pedido no válido', 'error');
      return;
    }

    // Verificar que el pedido no esté ya pagado
    if (pedido.estado) {
      Swal.fire('Información', 'Este pedido ya está marcado como pagado', 'info');
      return;
    }

    const total = pedido.importe_total - (pedido.importe_total_desc || 0);    Swal.fire({
      title: 'Procesar Pago con Stripe',      html: `
        <div class="text-left">
          <p><strong>Pedido #${pedido.id}</strong></p>
          <p>Total a pagar: <span class="text-blue-600 font-bold">$${total.toFixed(2)} USD</span></p>
          <p class="text-sm text-gray-500">Equivalente a: <strong>${this.obtenerPrecioEnBolivianos(total)}</strong></p>
          <p class="text-sm text-gray-600 mt-2">
            • Serás redirigido a Stripe para completar el pago de forma segura<br>
            • Después del pago regresarás automáticamente a esta página<br>
            • El estado del pedido se actualizará automáticamente a "Pagado"
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Proceder al Pago',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarPagoStripe(pedido.id!);
      }
    });
  }
  // Procesar el pago con Stripe
  private procesarPagoStripe(pedidoId: number): void {
    this.cargando = true;

    // Buscar el pedido para obtener los datos necesarios
    const pedido = this.pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      this.cargando = false;
      Swal.fire('Error', 'Pedido no encontrado', 'error');
      return;
    }    const total = pedido.importe_total - (pedido.importe_total_desc || 0);

    // Obtener información del usuario logueado
    const userEmail = this.authService.obtenerEmail() || 'cliente@email.com';
    const userName = this.authService.obtenerNombre() || 'Cliente';    // Crear la estructura de datos que espera el backend
    const checkoutData: StripeCheckoutRequest = {
      amount: total,
      currency: "usd",
      orderId: `ORDER_${pedidoId}`,
      description: pedido.descripcion || `Pago del pedido #${pedidoId}`,
      customerEmail: userEmail,
      customerName: userName,
      returnUrl: `${window.location.origin}${window.location.pathname}?payment_success=true&order_id=${pedidoId}`
    };

    this.stripeService.crearSesionCheckout(checkoutData).subscribe({
      next: (response) => {
        if (response.success && response.url) {
          // Redirigir a Stripe Checkout
          window.location.href = response.url;
        } else {
          console.error('Error en la respuesta:', response);
          Swal.fire('Error', response.error || 'No se pudo inicializar el pago', 'error');
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al crear sesión de Stripe:', error);
        this.cargando = false;

        let mensaje = 'No se pudo procesar el pago';
        if (error.error?.error) {
          mensaje = error.error.error;
        } else if (error.error?.message) {
          mensaje = error.error.message;
        }

        Swal.fire('Error', mensaje, 'error');
      }
    });
  }  // Verificar si el usuario regresó de Stripe
  private verificarRetornoDeStripe(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const paymentSuccess = urlParams.get('payment_success');
    const orderId = urlParams.get('order_id');

    if (sessionId && success === 'true') {
      // Pago exitoso con session_id de Stripe
      this.procesarPagoExitoso(null);
    } else if (paymentSuccess === 'true' && orderId) {
      // Pago exitoso con nuestros parámetros personalizados
      this.procesarPagoExitoso(parseInt(orderId));
    } else if (canceled === 'true') {
      // Pago cancelado
      Swal.fire('Pago Cancelado', 'El pago fue cancelado por el usuario', 'info');
      this.limpiarParametrosURL();
    }
  }

  // Procesar pago exitoso y actualizar estado del pedido
  private procesarPagoExitoso(orderId: number | null): void {
    if (orderId) {
      // Actualizar el estado del pedido específico a "pagado"
      this.pedidoService.cambiarEstadoPedido(orderId, true).subscribe({
        next: (response) => {
          // Buscar el pedido en la lista local y actualizarlo
          const pedidoIndex = this.pedidos.findIndex(p => p.id === orderId);
          if (pedidoIndex !== -1) {
            this.pedidos[pedidoIndex].estado = true;
            this.filtrarPedidos(); // Aplicar filtros nuevamente
          }

          Swal.fire('¡Pago Exitoso!', 'El pago se ha procesado correctamente y el pedido ha sido marcado como pagado', 'success');
          this.limpiarParametrosURL();
        },
        error: (error) => {
          console.error('Error al actualizar estado del pedido:', error);
          // Aún así mostrar éxito del pago, pero advertir sobre el estado
          Swal.fire('Pago Exitoso', 'El pago se procesó correctamente, pero hubo un problema al actualizar el estado del pedido. Por favor, actualice manualmente.', 'warning');
          this.cargarPedidos(); // Recargar toda la lista como respaldo
          this.limpiarParametrosURL();
        }
      });
    } else {
      // Si no tenemos el ID del pedido, solo recargar la lista
      Swal.fire('¡Pago Exitoso!', 'El pago se ha procesado correctamente', 'success');
      this.cargarPedidos(); // Recargar la lista para actualizar los estados
      this.limpiarParametrosURL();
    }
  }

  // Limpiar parámetros de la URL
  private limpiarParametrosURL(): void {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
  }

  // ✅ MÉTODOS PARA CONVERSIÓN DE MONEDAS

  // Convertir USD a Bolivianos bolivianos
  convertirUSDaBOB(montoUSD: number): number {
    return montoUSD * this.tipoCambioUSDaBOB;
  }

  // Formatear precio con ambas monedas
  formatearPrecioConBolivianos(montoUSD: number): string {
    const montoBOB = this.convertirUSDaBOB(montoUSD);
    return `$${montoUSD.toFixed(2)} USD (Bs. ${montoBOB.toFixed(2)})`;
  }
  // Obtener solo el monto en bolivianos formateado
  obtenerPrecioEnBolivianos(montoUSD: number): string {
    const montoBOB = this.convertirUSDaBOB(montoUSD);
    return `Bs. ${montoBOB.toFixed(2)}`;
  }
}

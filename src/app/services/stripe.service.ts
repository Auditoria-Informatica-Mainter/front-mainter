import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';

export interface StripeResponse {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
  message?: string;
}

export interface StripeCheckoutRequest {
  pedidoId: number;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  successUrl?: string;  // URL de retorno cuando el pago es exitoso
  cancelUrl?: string;   // URL de retorno cuando el pago es cancelado
}

// DTO que espera el backend (basado en el error)
export interface PaymentRequest {
  orderId: number;
  amount: number;
  currency: string;
  description?: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface StripeConfirmResponse {
  status: string;
  payment_status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    // Configurar la URL base correctamente para evitar doble barra
    this.baseUrl = environment.apiUrl;
    // Asegurar que no termine con /
    if (this.baseUrl.endsWith('/')) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
  }

  // Helper para construir URLs de Stripe específicamente
  private buildStripeUrl(endpoint: string): string {
    // Remover barra inicial del endpoint si existe
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.baseUrl}/api/stripe/${cleanEndpoint}`;

    console.log('🔗 Stripe URL construida:', url);

    // Verificar que no tenga doble barra
    if (url.includes('//') && !url.startsWith('http://') && !url.startsWith('https://')) {
      console.error('⚠️ URL con doble barra detectada en Stripe:', url);
      return url.replace(/([^:]\/)\/+/g, '$1');
    }

    return url;
  }  // Crear sesión de checkout de Stripe
  crearCheckoutSession(checkoutData: StripeCheckoutRequest): Observable<StripeResponse> {
    const url = this.buildStripeUrl('create-checkout-session');

    // Validar datos antes de enviar
    if (!checkoutData.pedidoId || checkoutData.pedidoId <= 0) {
      throw new Error('ID de pedido inválido');
    }

    if (!checkoutData.amount || checkoutData.amount <= 0) {
      throw new Error('Monto inválido');
    }    // Mapear los datos del frontend al formato que espera el backend
    const paymentRequest: PaymentRequest = {
      orderId: checkoutData.pedidoId,  // Mapear pedidoId -> orderId
      amount: Math.round(checkoutData.amount), // Asegurar que sea entero (no multiplicar por 100 aquí si ya viene en centavos)
      currency: checkoutData.currency || 'usd',
      description: checkoutData.description,
      customerEmail: checkoutData.customerEmail,
      successUrl: checkoutData.successUrl,
      cancelUrl: checkoutData.cancelUrl
    };

    console.log('🚀 POST a Stripe:', url);
    console.log('📤 Datos originales del frontend:', checkoutData);
    console.log('📤 Datos mapeados para el backend:', paymentRequest);

    return this.http.post<StripeResponse>(url, paymentRequest);
  }

  // Confirmar pago de Stripe
  confirmarPago(sessionId: string): Observable<StripeConfirmResponse> {
    const url = this.buildStripeUrl(`confirm-payment/${sessionId}`);
    console.log('🔍 GET a Stripe:', url);
    return this.http.get<StripeConfirmResponse>(url);
  }
  // Obtener configuración pública de Stripe
  obtenerConfiguracion(): Observable<any> {
    const url = this.buildStripeUrl('config');
    console.log('🔍 GET config de Stripe:', url);
    return this.http.get<any>(url);
  }
}

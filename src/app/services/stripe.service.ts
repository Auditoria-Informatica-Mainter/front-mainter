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
  orderId: number;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface StripeConfirmResponse {
  status: string;
  payment_status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl: string;
  constructor(private http: HttpClient) {
    // Asegurar que no haya doble barra en la URL
    const baseUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
    this.apiUrl = `${baseUrl}/api/stripe`;
  }

  get baseApiUrl(): string {
    return this.apiUrl;
  }

  // Crear sesión de checkout de Stripe
  crearCheckoutSession(checkoutData: StripeCheckoutRequest): Observable<StripeResponse> {
    return this.http.post<StripeResponse>(`${this.apiUrl}/create-checkout-session`, checkoutData);
  }

  // Confirmar pago de Stripe
  confirmarPago(sessionId: string): Observable<StripeConfirmResponse> {
    return this.http.get<StripeConfirmResponse>(`${this.apiUrl}/confirm-payment/${sessionId}`);
  }

  // Obtener configuración pública de Stripe
  obtenerConfiguracion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/config`);
  }
}

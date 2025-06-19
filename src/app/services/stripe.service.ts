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
}

export interface StripeConfirmResponse {
  status: string;
  payment_status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = `${environment.apiUrl}/api/stripe`;

  constructor(private http: HttpClient) {}

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

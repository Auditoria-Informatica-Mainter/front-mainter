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
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = `${environment.apiUrl}api/stripe`;

  constructor(private http: HttpClient) {}

  // Crear sesión de checkout de Stripe
  crearSesionCheckout(checkoutData: StripeCheckoutRequest): Observable<StripeResponse> {
    return this.http.post<StripeResponse>(`${this.apiUrl}/create-checkout-session`, checkoutData);
  }

  // Obtener configuración pública de Stripe
  obtenerConfiguracion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/config`);
  }
}

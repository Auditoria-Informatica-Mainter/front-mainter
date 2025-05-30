import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, tap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obtenerToken();
  // Excluir Cloudinary y Login
  const isCloudinary = req.url.includes('api.cloudinary.com');

  // Endpoints que no deben llevar token
  const publicEndpoints = [
    'auth/login',
    'auth/register'
  ];

  if (isCloudinary) {
    return next(req); // no modificar
  }

  const isPublic = publicEndpoints.some(url => req.url.includes(url));

  const authReq = isPublic
    ? req
    : req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  return next(authReq);
};
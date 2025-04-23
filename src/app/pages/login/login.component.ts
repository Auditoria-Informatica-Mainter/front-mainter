import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.token);
        this.authService.guardarDatosUsuario(res.nombre, res.email);
        
        alert('¡Inicio de sesión exitoso!');
        this.router.navigate(['/usuario']);
      },
      error: (err) => {
        console.error('Error de login:', err);
        alert('Credenciales inválidas');
      }
    });
  }
}

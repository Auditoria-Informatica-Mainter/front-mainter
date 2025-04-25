import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./register-admin.component.css'],
  templateUrl: './register-admin.component.html'
})
export class RegisterAdminComponent {
  nombre: string = '';
  apellido: string = '';
  telefono: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    // Validar que las contraseñas coincidan
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Llamar al servicio de registro
    this.registrarUsuario();
  }

  registrarUsuario() {
    this.authService.registro(this.nombre, this.apellido, this.telefono, this.email, this.password).subscribe({
      next: (res) => {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        alert('Error al registrar usuario: ' + (err.error?.message || 'Intente nuevamente'));
      }
    });
  }
}

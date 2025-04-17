import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare var Flowbite: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true
})
export class SidebarComponent {
  nombreUsuario: string = '';
  emailUsuario: string = '';

  ngAfterViewInit(): void {
    // Si Flowbite usa auto init, esto lo asegura
    if (typeof Flowbite !== 'undefined') {
      Flowbite.init();
    }
  }

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.nombreUsuario = this.authService.obtenerNombre();
    this.emailUsuario = this.authService.obtenerEmail();
  }

  logout(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
//import { error } from 'console';
import swal from 'sweetalert2'
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/rol.service';
import { Rol } from '../../models/rol.model';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [FormsModule, CommonModule],   
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent  {

  roles: Rol[] = [];

  constructor(private roleService: RoleService) {}

  ngOnInit() {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.roleService.obtenerRoles().subscribe({
      next: (data) => this.roles = data,
      error: (err) => console.error('Error al cargar roles', err)
    });
  }
}


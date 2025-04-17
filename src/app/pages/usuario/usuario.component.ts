import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import Swal from 'sweetalert2'
//import { error } from 'console';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/rol.service';
import { UsuarioDTO } from '../../models/usuario.model';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})

export class UsuarioComponent {

  isModalRegisterUserOpen: boolean = false;
  isModalUpdateUserOpen: boolean = false;
  username: any;
  apellido: any;
  password: any;
  email: any;
  telefono: any;
  direccion: any;
  selectedRole: any = "";
  roles: Array<any>;
  users: Array<any> = [];
  usernameUpdate: any;
  apellidoUpdate: any;
  passwordUpdate: any;
  emailUpdate: any;
  telefonoUpdate: any;
  direccionUpdate: any;
  roleUpdate: any;
  userIdSelected: any;
  

  constructor(private userService: UserService, private roleService: RoleService) {
    this.roles = [];
    this.getRoles();
    this.getUsers();
  }

 
  getRoles() {

    this.roleService.getRoles().subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          this.roles = resp;
        },
        error: (error: any) => {
          console.log(error);
        }
      }
    );
  }

  activeRegisterForm() {

    this.isModalRegisterUserOpen = true;

  }

  registrarUsuario() {
    const selectedRoleObj = this.roles.find(r => r.id === +this.selectedRole);
    const permiso = selectedRoleObj?.permisos[0];
    let user: UsuarioDTO = {
        nombre: this.username,
        apellido: this.apellido,
        password: this.password,
        email: this.email,
        telefono: this.telefono,
        direccion: this.direccion,
        // rol: { id: this.selectedRole  },
        rolid: this.selectedRole,
       // permisos: { id: permiso?.id }
       //permisos: permiso,
    };

    this.userService.registrarUsuario(user).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp.user_id || resp.user_id >= 1) {

            this.getUsers();

            Swal.fire({
              position: "center",
              icon: "success",
              title: "Usuario registrado!",
              showConfirmButton: false,
              timer: 2500
            });

            setTimeout(() => {
              this.closeRegisterUserModal();
            }, 2600);
          } else {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Usuario registrado!",
              showConfirmButton: false,
              timer: 2500
            });
          }

        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );
  }

  registerUser() {
    let user = {
      nombre: this.username,
      apellido: this.username,
      password: this.password,
      email: this.email,
      telefono: this.telefono,
      direccion:this.direccion,
      rolid: this.selectedRole
    };

    this.userService.registrarUsuario(user).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp.id || resp.id >= 1) {
            this.getUsers();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Usuario registrado!",
              showConfirmButton: false,
              timer: 2500
            });
            setTimeout(() => {
              this.closeRegisterUserModal();
            }, 2600);
          } else {
            Swal.fire({
              position: "center",
              icon: "error",
              title: "Error al registrar el usuario!",
              showConfirmButton: false,
              timer: 2500
            });
          }
        },
        error: (error: any) => {
          console.log('Error al registrar usuario:', error);
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Error al registrar el usuario!",
            showConfirmButton: false,
            timer: 2500
          });
        }
      }
    );
  }


  getUsers() {

    this.userService.listarUsuarios().subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          this.users = resp;
        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );
  }

  openModalToUpdateUser(user: any) {
    console.log('user id: ' + user.id);
    this.isModalUpdateUserOpen = true;
    this.usernameUpdate = user.username;
    this.passwordUpdate = user.password;
    this.emailUpdate = user.email;
    this.telefonoUpdate = user.telefono;
    this.direccionUpdate = user.direccion;
    this.roleUpdate = user.role.id;
    this.userIdSelected = user.id;
  }

  actualizarUsuario() {
    const selectedRoleObj = this.roles.find(r => r.id === +this.roleUpdate);
    const permiso = selectedRoleObj?.permisos[0];
    let userData = {
      nombre: this.usernameUpdate,
      apellido: this.apellidoUpdate,
      password: this.passwordUpdate,
      email: this.emailUpdate,
      telefono: this.telefonoUpdate,
      direccion: this.direccionUpdate,
      // rol: { id: this.roleUpdate },
      rolid: this.selectedRole,
      // permisos: { id: permiso?.id }
      permisos: permiso,
    };

    this.userService.actualizarUsuario(this.userIdSelected, userData).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          if (resp) {
            this.getUsers();
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Usuario actualizado!",
              showConfirmButton: false,
              timer: 2500
            });

            setTimeout(() => {
              this.closeUpdateUserModal();
            }, 2600);
          }

        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );
  }

  deleteUser(user: any) {


    this.userService.deleteUser(user.id).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          this.getUsers();
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Usuario eliminado!",
            showConfirmButton: false,
            timer: 2500
          });
        },
        error: (error: any) => {
          console.log(error);

        }
      }
    );

  }

  updateRoleId($event: any) {
    this.roleUpdate = $event;
    console.log(this.roleUpdate);
    console.log($event);

  }

  closeRegisterUserModal() {
    this.isModalRegisterUserOpen = false;
  }

  closeUpdateUserModal() {
    this.isModalUpdateUserOpen = false;
  }
}

import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { RolComponent } from './pages/rol/rol.component';
//import { ProductoComponent } from './pages/productos/producto.component';
//import { VentasComponent } from './pages/ventas/ventas.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'usuario', component: UsuarioComponent },
  { path: 'roles', component: RolComponent },
 // { path: 'productos', component: ProductoComponent },
 // { path: 'ventas', component: VentasComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { RolComponent } from './pages/rol/rol.component';
import CategoriasComponent from './pages/categorias/categorias.component';
import { SubcategoriasComponent } from './pages/subcategorias/subcategorias.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { BitacoraComponent } from './pages/bitacora/bitacora.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'usuario', component: UsuarioComponent },
  { path: 'roles', component: RolComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'subcategorias', component: SubcategoriasComponent },
  { path: 'mrp', component: LandingPageComponent },
  { path: 'bitacoras', component: BitacoraComponent },
  // { path: '', redirectTo: 'login', pathMatch: 'full' },  //anterior pagina de inicio por defecto
  { path: '', redirectTo: 'mrp', pathMatch: 'full' },
  { path: '**', redirectTo: '/mrp' },

];

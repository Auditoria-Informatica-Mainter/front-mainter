import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';
import { RolComponent } from './pages/rol/rol.component';
import { RegisterAdminComponent } from './pages/register-admin/register-admin.component';
import CategoriasComponent from './pages/categorias/categorias.component';
import { SubcategoriasComponent } from './pages/subcategorias/subcategorias.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { SectorComponent } from './pages/sector/sector.component';
import AlmacenComponent from './pages/almacen/almacen.component';
import { MaterialesComponent } from './pages/materiales/materiales.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { BitacoraComponent } from './pages/bitacora/bitacora.component';
import { ProveedorMaterialComponent } from './pages/proveedor-material/proveedor-material.component';
import { PreProductoComponent } from './pages/pre-producto/pre-producto.component';
import { PlanoComponent } from './pages/plano/plano.component';
import { PrePlanoComponent } from './pages/pre-plano/pre-plano.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterAdminComponent },
  { path: 'usuario', component: UsuarioComponent },
  { path: 'roles', component: RolComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'subcategorias', component: SubcategoriasComponent },
  { path: 'proveedores', component: ProveedoresComponent },
  { path: 'proveedorMaterial', component: ProveedorMaterialComponent },
  { path: 'almacen', component: AlmacenComponent },
  { path: 'sector', component: SectorComponent },
  { path: 'materiales', component: MaterialesComponent },
  { path: 'compras', component: ComprasComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: 'pre-producto', component: PreProductoComponent },
  { path: 'pre-plano', component: PrePlanoComponent },
  { path: 'plano', component: PlanoComponent },
  { path: 'mrp', component: LandingPageComponent },
  { path: 'bitacoras', component: BitacoraComponent },
  // { path: '', redirectTo: 'login', pathMatch: 'full' },  //anterior pagina de inicio por defecto
  { path: '', redirectTo: 'mrp', pathMatch: 'full' },
  { path: '**', redirectTo: '/mrp' },

];

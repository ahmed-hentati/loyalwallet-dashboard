import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/navbar/navbar.component').then(m => m.NavbarComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'scanner',   loadComponent: () => import('./pages/scanner/scanner.component').then(m => m.ScannerComponent) },
      { path: 'cards',     loadComponent: () => import('./pages/cards/cards.component').then(m => m.CardsComponent) },
      { path: 'clients',   loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

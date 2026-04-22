import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  // ── Pages publiques (pas besoin d'être connecté) ──
  {
    path: 'register/:restaurantId/:cardId',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'card/:serialNumber',
    loadComponent: () => import('./pages/card-page/card-page.component').then(m => m.CardPageComponent),
  },
  // ── Pages protégées ──
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/navbar/navbar.component').then(m => m.NavbarComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'scanner',   loadComponent: () => import('./pages/scanner/scanner.component').then(m => m.ScannerComponent) },
      { path: 'cards',     loadComponent: () => import('./pages/cards/cards.component').then(m => m.CardsComponent) },
      { path: 'clients',   loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent) },
      { path: 'campaigns', loadComponent: () => import('./pages/campaigns/campaigns.component').then(m => m.CampaignsComponent) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

const DEMO_EMAIL    = 'demo@loyalwallet.app';
const DEMO_PASSWORD = 'demo1234';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  mode    = signal<'login' | 'register'>('login');
  loading = signal(false);
  error   = signal('');

  login(email: string, password: string) {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.error.set(err.error?.error ?? 'Erreur de connexion'); this.loading.set(false); },
    });
  }

  loginDemo() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(DEMO_EMAIL, DEMO_PASSWORD).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Compte démo non disponible pour l\'instant');
        this.loading.set(false);
      },
    });
  }

  register(name: string, email: string, password: string, phone: string) {
    this.loading.set(true);
    this.error.set('');
    this.auth.register({ name, email, password, phone: phone || undefined }).subscribe({
      next: () => this.router.navigate(['/onboarding']),
      error: err => { this.error.set(err.error?.error ?? 'Erreur de création'); this.loading.set(false); },
    });
  }
}


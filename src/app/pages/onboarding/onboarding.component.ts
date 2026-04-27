import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  private http   = inject(HttpClient);
  private router = inject(Router);
  auth           = inject(AuthService);

  step = signal<1 | 2 | 3>(1);

  // Step 1 — Infos
  phone      = signal('');
  address    = signal('');
  city       = signal('');
  postalCode = signal('');
  website    = signal('');
  savingInfo = signal(false);

  // Step 2 — Logo
  logoPreview   = signal('');
  uploadingLogo = signal(false);

  // ── Step 1 : Sauvegarder les infos ───────────────────────
  saveInfo(skip = false) {
    if (this.savingInfo()) return;

    if (skip) {
      this.step.set(2);
      return;
    }

    this.savingInfo.set(true);
    this.http.put<any>(`${environment.apiUrl}/restaurants/me`, {
      phone:       this.phone()       || null,
      address:     this.address()     || null,
      city:        this.city()        || null,
      postal_code: this.postalCode()  || null,
      website:     this.website()     || null,
    }).subscribe({
      next: res => {
        this.auth.updateRestaurant(res);
        this.savingInfo.set(false);
        this.step.set(2);
      },
      error: () => {
        this.savingInfo.set(false);
        this.step.set(2); // on continue même en cas d'erreur
      },
    });
  }

  // ── Step 2 : Upload logo ──────────────────────────────────
  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.uploadingLogo.set(true);
    const formData = new FormData();
    formData.append('logo', file);

    this.http.post<{ logo_url: string }>(`${environment.apiUrl}/upload/logo`, formData).subscribe({
      next: res => {
        this.auth.updateRestaurant({ logo_url: res.logo_url });
        this.uploadingLogo.set(false);
      },
      error: () => this.uploadingLogo.set(false),
    });
  }

  goToFinish() { this.step.set(3); }

  goToDashboard() { this.router.navigate(['/dashboard']); }

  restaurantName(): string {
    return this.auth.restaurant()?.name ?? 'votre commerce';
  }
}

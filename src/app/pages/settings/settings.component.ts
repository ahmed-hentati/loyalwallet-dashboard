import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private http = inject(HttpClient);
  auth         = inject(AuthService);

  // Form
  name  = signal('');
  phone = signal('');

  // States
  loading       = signal(true);
  saving        = signal(false);
  saved         = signal(false);
  uploadingLogo = signal(false);
  logoPreview   = signal('');
  copied        = signal(false);

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/restaurants/me`).subscribe({
      next: res => {
        this.name.set(res.name ?? '');
        this.phone.set(res.phone ?? '');
        this.logoPreview.set(res.logo_url ?? '');
        // Mettre à jour le signal auth avec les données fraîches
        this.auth.restaurant.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save() {
    if (this.saving()) return;
    this.saving.set(true);

    this.http.put<any>(`${environment.apiUrl}/restaurants/me`, {
      name:  this.name(),
      phone: this.phone(),
    }).subscribe({
      next: res => {
        this.auth.updateRestaurant(res);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => this.saving.set(false),
    });
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Preview immédiate
    const reader = new FileReader();
    reader.onload = (e) => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload → Cloudinary
    this.uploadingLogo.set(true);
    const formData = new FormData();
    formData.append('logo', file);

    this.http.post<{ logo_url: string }>(`${environment.apiUrl}/upload/logo`, formData).subscribe({
      next: res => {
        this.auth.updateRestaurant({ logo_url: res.logo_url });
        this.logoPreview.set(res.logo_url);
        this.uploadingLogo.set(false);
      },
      error: () => this.uploadingLogo.set(false),
    });
  }

  removeLogo() {
    this.http.put<any>(`${environment.apiUrl}/restaurants/me`, { logo_url: '' }).subscribe({
      next: () => {
        this.logoPreview.set('');
        this.auth.updateRestaurant({ logo_url: undefined });
      }
    });
  }

  publicPageUrl(): string {
    const slug = this.auth.restaurant()?.slug;
    return slug ? `${window.location.origin}/restaurant/${slug}` : '';
  }

  async copyPublicUrl() {
    await navigator.clipboard.writeText(this.publicPageUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}

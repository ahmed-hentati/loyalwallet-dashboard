import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private http   = inject(HttpClient);
  private router = inject(Router);
  auth           = inject(AuthService);

  loading = signal(true);

  // ── Section 02 : Infos ───────────────────────────────────
  name       = signal('');
  phone      = signal('');
  address    = signal('');
  city       = signal('');
  postalCode = signal('');
  website    = signal('');
  logoPreview    = signal('');
  uploadingLogo  = signal(false);
  savingInfo     = signal(false);
  savedInfo      = signal(false);

  // ── Section 03 : Google Avis ─────────────────────────────
  googleReviewUrl         = signal('');
  googleReviewEnabled     = signal(false);
  googleReviewAfterVisits = signal(5);
  savingReview            = signal(false);
  savedReview             = signal(false);

  // ── Section 04 : Suppression ─────────────────────────────
  showDeleteConfirm  = signal(false);
  deleteConfirmText  = signal('');
  deleting           = signal(false);

  // Page publique
  copied = signal(false);

  visitOptions = [3, 5, 8, 10];

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/restaurants/me`).subscribe({
      next: res => {
        this.name.set(res.name ?? '');
        this.phone.set(res.phone ?? '');
        this.address.set(res.address ?? '');
        this.city.set(res.city ?? '');
        this.postalCode.set(res.postal_code ?? '');
        this.website.set(res.website ?? '');
        this.logoPreview.set(res.logo_url ?? '');
        this.googleReviewUrl.set(res.google_review_url ?? '');
        this.googleReviewEnabled.set(res.google_review_enabled ?? false);
        this.googleReviewAfterVisits.set(res.google_review_after_visits ?? 5);
        this.auth.updateRestaurant(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ── Infos publiques ───────────────────────────────────────
  saveInfo() {
    if (this.savingInfo()) return;
    this.savingInfo.set(true);

    this.http.put<any>(`${environment.apiUrl}/restaurants/me`, {
      name:        this.name(),
      phone:       this.phone()       || null,
      address:     this.address()     || null,
      city:        this.city()        || null,
      postal_code: this.postalCode()  || null,
      website:     this.website()     || null,
    }).subscribe({
      next: res => {
        this.auth.updateRestaurant(res);
        this.savingInfo.set(false);
        this.savedInfo.set(true);
        setTimeout(() => this.savedInfo.set(false), 3000);
      },
      error: () => this.savingInfo.set(false),
    });
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => this.logoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.uploadingLogo.set(true);
    const fd = new FormData();
    fd.append('logo', file);

    this.http.post<{ logo_url: string }>(`${environment.apiUrl}/upload/logo`, fd).subscribe({
      next: res => {
        this.auth.updateRestaurant({ logo_url: res.logo_url });
        this.logoPreview.set(res.logo_url);
        this.uploadingLogo.set(false);
      },
      error: () => this.uploadingLogo.set(false),
    });
  }

  // ── Google Avis ───────────────────────────────────────────
  saveReview() {
    if (this.savingReview()) return;
    this.savingReview.set(true);

    this.http.put<any>(`${environment.apiUrl}/restaurants/me`, {
      google_review_url:          this.googleReviewUrl() || null,
      google_review_enabled:      this.googleReviewEnabled(),
      google_review_after_visits: this.googleReviewAfterVisits(),
    }).subscribe({
      next: () => {
        this.savingReview.set(false);
        this.savedReview.set(true);
        setTimeout(() => this.savedReview.set(false), 3000);
      },
      error: () => this.savingReview.set(false),
    });
  }

  // ── Suppression ───────────────────────────────────────────
  canDelete(): boolean {
    return this.deleteConfirmText().toLowerCase() === 'supprimer';
  }

  deleteAccount() {
    if (!this.canDelete() || this.deleting()) return;
    this.deleting.set(true);

    this.http.delete(`${environment.apiUrl}/restaurants/me`).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      },
      error: () => this.deleting.set(false),
    });
  }

  // ── Page publique ─────────────────────────────────────────
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

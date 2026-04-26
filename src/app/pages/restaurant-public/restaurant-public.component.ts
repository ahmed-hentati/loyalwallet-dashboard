import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-restaurant-public',
  standalone: true,
  templateUrl: './restaurant-public.component.html',
  styleUrl: './restaurant-public.component.scss',
})
export class RestaurantPublicComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http  = inject(HttpClient);

  data    = signal<any>(null);
  loading = signal(true);
  error   = signal('');

  ngOnInit() {
    const slug = this.route.snapshot.params['slug'];
    this.http.get<any>(`${environment.apiUrl}/public/restaurant/${slug}`).subscribe({
      next: res => { this.data.set(res); this.loading.set(false); },
      error: ()  => { this.error.set('Restaurant introuvable'); this.loading.set(false); },
    });
  }

  getRegisterUrl(card: any): string {
    return `${window.location.origin}/register/${this.data()?.id}/${card.id}`;
  }

  getQrUrl(card: any): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(this.getRegisterUrl(card))}&bgcolor=ffffff&color=000000&qzone=2`;
  }

  cardBackground(card: any): string {
    return card.background_gradient || card.background_color || '#1a1a1a';
  }

  shareUrl(): string {
    return window.location.href;
  }

  async copyLink() {
    await navigator.clipboard.writeText(this.shareUrl());
  }
}

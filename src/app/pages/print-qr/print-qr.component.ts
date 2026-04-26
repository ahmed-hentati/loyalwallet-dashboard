import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-print-qr',
  standalone: true,
  templateUrl: './print-qr.component.html',
  styleUrl: './print-qr.component.scss',
})
export class PrintQrComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  cards      = signal<any[]>([]);
  selected   = signal<any>(null);
  loading    = signal(true);
  format     = signal<'table' | 'a5' | 'a4'>('table');

  ngOnInit() {
    this.api.getCards().subscribe(cards => {
      this.cards.set(cards);
      if (cards.length > 0) this.selected.set(cards[0]);
      this.loading.set(false);
    });
  }

  getRegisterUrl(): string {
    const restaurantId = this.auth.restaurant()?.id;
    const card = this.selected();
    if (!card || !restaurantId) return '';
    return `${window.location.origin}/register/${restaurantId}/${card.id}`;
  }

  getQrUrl(): string {
    const url = this.getRegisterUrl();
    if (!url) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&qzone=2`;
  }

  restaurantName(): string {
    return this.auth.restaurant()?.name ?? 'Mon Restaurant';
  }

  print() {
    window.print();
  }

  selectCard(card: any) {
    this.selected.set(card);
  }
}

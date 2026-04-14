import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CardHolder, LoyaltyCard } from '../../models';

@Component({
  selector: 'app-clients',
  standalone: true,
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);

  clients      = signal<CardHolder[]>([]);
  allCards     = signal<LoyaltyCard[]>([]);
  loading      = signal(true);
  search       = signal('');
  showModal    = signal(false);
  creating     = signal(false);
  createResult = signal<any>(null);

  private searchTimer: any;

  ngOnInit() {
    this.load();
    this.api.getCards().subscribe(c => this.allCards.set(c));
  }

  ngOnDestroy() { clearTimeout(this.searchTimer); }

  load() {
    this.api.getClients(this.search() || undefined).subscribe(c => {
      this.clients.set(c);
      this.loading.set(false);
    });
  }

  onSearch(val: string) {
    this.search.set(val);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 300);
  }

  getCard(cardId: string) { return this.allCards().find(c => c.id === cardId); }
  range(n: number)        { return Array.from({ length: n }, (_, i) => i); }
  clamp(v: number)        { return Math.min(100, Math.max(0, v)); }
  formatDate(iso: string) { return new Date(iso).toLocaleDateString('fr-FR'); }

  createClient(cardId: string, name: string, phone: string) {
    if (!cardId) return;
    this.creating.set(true);
    this.api.createPass(cardId, name || undefined, phone || undefined).subscribe({
      next: res => { this.createResult.set(res); this.creating.set(false); this.load(); },
      error: () => this.creating.set(false),
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.createResult.set(null);
  }
}

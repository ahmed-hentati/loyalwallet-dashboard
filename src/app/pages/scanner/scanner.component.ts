import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ScanResult, LoyaltyCard } from '../../models';

@Component({
  selector: 'app-scanner',
  standalone: true,
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss',
})
export class ScannerComponent implements OnInit {
  private api = inject(ApiService);

  loading       = signal(false);
  result        = signal<ScanResult | null>(null);
  error         = signal('');
  showNewClient = signal(false);
  cards         = signal<LoyaltyCard[]>([]);
  creating      = signal(false);
  createResult  = signal<any>(null);

  ngOnInit() {
    this.api.getCards().subscribe(c => this.cards.set(c));
  }

  doScan(serial: string) {
    if (!serial || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.api.scan(serial.toUpperCase()).subscribe({
      next: res => { this.result.set(res); this.loading.set(false); },
      error: err => { this.error.set(err.error?.error ?? 'Carte introuvable'); this.loading.set(false); },
    });
  }

  reset() {
    this.result.set(null);
    this.error.set('');
  }

  range(n: number) {
    return Array.from({ length: n }, (_, i) => i);
  }

  createClient(cardId: string, name: string, phone: string) {
    if (!cardId) return;
    this.creating.set(true);
    this.api.createPass(cardId, name || undefined, phone || undefined).subscribe({
      next: res => { this.createResult.set(res); this.creating.set(false); },
      error: () => this.creating.set(false),
    });
  }

  closeNewClient() {
    this.showNewClient.set(false);
    this.createResult.set(null);
  }
}

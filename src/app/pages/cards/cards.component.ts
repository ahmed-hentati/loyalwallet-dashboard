import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LoyaltyCard } from '../../models';
import { environment } from '../../../environments/environment';

export interface CardForm {
  card_name: string;
  loyalty_type: 'stamp' | 'points';
  stamp_total: number;
  stamp_per_visit: number;
  points_per_visit: number;
  points_for_reward: number;
  reward_description: string;
  background_color: string;
  foreground_color: string;
  label_color: string;
}

@Component({
  selector: 'app-cards',
  standalone: true,
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss',
})
export class CardsComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  cards     = signal<LoyaltyCard[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving    = signal(false);
  form      = signal<CardForm>(this.defaultForm());

  // QR modal
  showQr    = signal(false);
  qrCard    = signal<LoyaltyCard | null>(null);

  getRegisterUrl(card: LoyaltyCard): string {
    const restaurantId = this.auth.restaurant()?.id;
    const frontendUrl = window.location.origin; // https://loyalwallet-dashboard.vercel.app
    return `${frontendUrl}/register/${restaurantId}/${card.id}`;
  }

  colorFields = [
    { key: 'background_color', label: 'Fond'   },
    { key: 'foreground_color', label: 'Texte'  },
    { key: 'label_color',      label: 'Labels' },
  ];

  ngOnInit() { this.load(); }

  load() {
    this.api.getCards().subscribe(c => { this.cards.set(c); this.loading.set(false); });
  }

  defaultForm(): CardForm {
    return {
      card_name: '', loyalty_type: 'stamp',
      stamp_total: 10, stamp_per_visit: 1,
      points_per_visit: 1, points_for_reward: 50,
      reward_description: '',
      background_color: '#1a1a1a', foreground_color: '#ffffff', label_color: '#cccccc',
    };
  }

  patch(key: string, value: any) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  getColor(key: string): string {
    return (this.form() as any)[key];
  }

  openCreate() {
    this.editingId.set(null);
    this.form.set(this.defaultForm());
    this.showModal.set(true);
  }

  openEdit(card: LoyaltyCard) {
    this.editingId.set(card.id);
    this.form.set({
      card_name: card.card_name, loyalty_type: card.loyalty_type,
      stamp_total: card.stamp_total, stamp_per_visit: card.stamp_per_visit,
      points_per_visit: card.points_per_visit, points_for_reward: card.points_for_reward,
      reward_description: card.reward_description,
      background_color: card.background_color,
      foreground_color: card.foreground_color,
      label_color: card.label_color,
    });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  save() {
    this.saving.set(true);
    const id = this.editingId();
    const obs = id
      ? this.api.updateCard(id, this.form())
      : this.api.createCard(this.form());

    obs.subscribe({
      next: () => { this.load(); this.closeModal(); this.saving.set(false); },
      error: () => this.saving.set(false),
    });
  }
}

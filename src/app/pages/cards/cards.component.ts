import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LoyaltyCard } from '../../models';

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
  background_gradient: string;
  card_pattern: string;
  logo_emoji: string;
}

// ── Templates prédéfinis ───────────────────────────────────
export const CARD_TEMPLATES = [
  {
    id: 'cafe',
    name: '☕ Café',
    background_color: '#1A0A00',
    background_gradient: 'linear-gradient(135deg, #1A0A00 0%, #3D1F00 100%)',
    foreground_color: '#F5E6D0',
    label_color: '#C4956A',
    card_pattern: 'dots',
    logo_emoji: '☕',
  },
  {
    id: 'boulangerie',
    name: '🥐 Boulangerie',
    background_color: '#8B6914',
    background_gradient: 'linear-gradient(135deg, #8B6914 0%, #C4952A 100%)',
    foreground_color: '#FFF8E7',
    label_color: '#FFE4A0',
    card_pattern: 'waves',
    logo_emoji: '🥐',
  },
  {
    id: 'restaurant',
    name: '🍕 Restaurant',
    background_color: '#8B1A1A',
    background_gradient: 'linear-gradient(135deg, #8B1A1A 0%, #C0392B 100%)',
    foreground_color: '#FFFFFF',
    label_color: '#FFB3B3',
    card_pattern: 'grid',
    logo_emoji: '🍽️',
  },
  {
    id: 'glacier',
    name: '🍦 Glacier',
    background_color: '#5B8FD4',
    background_gradient: 'linear-gradient(135deg, #5B8FD4 0%, #A8D8EA 100%)',
    foreground_color: '#FFFFFF',
    label_color: '#E0F4FF',
    card_pattern: 'none',
    logo_emoji: '🍦',
  },
  {
    id: 'coiffeur',
    name: '💇 Coiffeur',
    background_color: '#1A1A2E',
    background_gradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    foreground_color: '#E0E0E0',
    label_color: '#C9A84C',
    card_pattern: 'lines',
    logo_emoji: '✂️',
  },
  {
    id: 'sushi',
    name: '🍣 Sushi',
    background_color: '#0D1B2A',
    background_gradient: 'linear-gradient(135deg, #0D1B2A 0%, #1B3A4B 100%)',
    foreground_color: '#FFFFFF',
    label_color: '#E84545',
    card_pattern: 'none',
    logo_emoji: '🍣',
  },
  {
    id: 'sport',
    name: '💪 Sport',
    background_color: '#1DB954',
    background_gradient: 'linear-gradient(135deg, #1DB954 0%, #0D8C3A 100%)',
    foreground_color: '#FFFFFF',
    label_color: '#A8FFD0',
    card_pattern: 'grid',
    logo_emoji: '💪',
  },
  {
    id: 'dark',
    name: '🖤 Minimaliste',
    background_color: '#0E0E0E',
    background_gradient: '',
    foreground_color: '#FFFFFF',
    label_color: '#888888',
    card_pattern: 'none',
    logo_emoji: '⚡',
  },
];

export const EMOJIS = ['☕', '🥐', '🍕', '🍦', '✂️', '🍣', '💪', '🎯', '🌟', '❤️', '🎁', '🏆', '🍰', '🍔', '🥗', '🍜', '🍷', '🎂', '🌸', '💎'];

export const PATTERNS = [
  { id: 'none',  label: 'Uni' },
  { id: 'dots',  label: 'Points' },
  { id: 'grid',  label: 'Grille' },
  { id: 'waves', label: 'Vagues' },
  { id: 'lines', label: 'Lignes' },
];

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
  showQr     = signal(false);
  qrCard     = signal<LoyaltyCard | null>(null);
  qrDataUrl  = signal<string>('');
  phoneInput = signal('');
  copied     = signal(false);

  // Editor tab
  editorTab  = signal<'info' | 'design'>('info');

  templates  = CARD_TEMPLATES;
  emojis     = EMOJIS;
  patterns   = PATTERNS;

  ngOnInit() { this.load(); }

  load() {
    this.api.getCards().subscribe(c => { this.cards.set(c); this.loading.set(false); });
  }

  defaultForm(): CardForm {
    return {
      card_name: '',
      loyalty_type: 'stamp',
      stamp_total: 10,
      stamp_per_visit: 1,
      points_per_visit: 1,
      points_for_reward: 50,
      reward_description: '',
      background_color: '#1a1a1a',
      foreground_color: '#ffffff',
      label_color: '#aaaaaa',
      background_gradient: '',
      card_pattern: 'none',
      logo_emoji: '🎯',
    };
  }

  openCreate() {
    this.editingId.set(null);
    this.form.set(this.defaultForm());
    this.editorTab.set('info');
    this.showModal.set(true);
  }

  openEdit(card: LoyaltyCard) {
    this.editingId.set(card.id);
    this.form.set({
      card_name:           card.card_name,
      loyalty_type:        card.loyalty_type,
      stamp_total:         card.stamp_total,
      stamp_per_visit:     card.stamp_per_visit,
      points_per_visit:    card.points_per_visit,
      points_for_reward:   card.points_for_reward,
      reward_description:  card.reward_description,
      background_color:    card.background_color,
      foreground_color:    card.foreground_color,
      label_color:         card.label_color,
      background_gradient: (card as any).background_gradient ?? '',
      card_pattern:        (card as any).card_pattern ?? 'none',
      logo_emoji:          (card as any).logo_emoji ?? '🎯',
    });
    this.editorTab.set('info');
    this.showModal.set(true);
  }

  applyTemplate(t: typeof CARD_TEMPLATES[0]) {
    this.form.update(f => ({
      ...f,
      background_color:    t.background_color,
      background_gradient: t.background_gradient,
      foreground_color:    t.foreground_color,
      label_color:         t.label_color,
      card_pattern:        t.card_pattern,
      logo_emoji:          t.logo_emoji,
    }));
  }

  updateForm(key: keyof CardForm, value: any) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  save() {
    if (this.saving()) return;
    this.saving.set(true);
    const f = this.form();
    const id = this.editingId();

    const obs = id
      ? this.api.updateCard(id, f)
      : this.api.createCard(f);

    obs.subscribe({
      next: () => { this.load(); this.showModal.set(false); this.saving.set(false); },
      error: ()  => this.saving.set(false),
    });
  }

  openQr(card: LoyaltyCard) {
    this.qrCard.set(card);
    this.qrDataUrl.set('');
    this.phoneInput.set('');
    this.copied.set(false);
    this.showQr.set(true);
    const url = encodeURIComponent(this.getRegisterUrl(card));
    this.qrDataUrl.set(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${url}`);
  }

  getRegisterUrl(card: LoyaltyCard): string {
    const restaurantId = this.auth.restaurant()?.id;
    return `${window.location.origin}/register/${restaurantId}/${card.id}`;
  }

  sendSms(card: LoyaltyCard, phone: string) {
    if (!phone) return;
    const url = this.getRegisterUrl(card);
    const msg = encodeURIComponent(`Votre carte de fidélité ${card.card_name} 🎯 : ${url}`);
    window.open(`sms:${phone}?body=${msg}`, '_blank');
  }

  async copyLink(card: LoyaltyCard) {
    await navigator.clipboard.writeText(this.getRegisterUrl(card));
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  // Génère le style CSS de la carte pour la preview
  cardBackground(f: CardForm): string {
    return f.background_gradient || f.background_color;
  }

  patternSvg(pattern: string, color: string): string {
    const c = encodeURIComponent(color);
    switch (pattern) {
      case 'dots':
        return `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='${c}' fill-opacity='0.15'/%3E%3C/svg%3E")`;
      case 'grid':
        return `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='${c}' stroke-opacity='0.1' stroke-width='0.5'/%3E%3C/svg%3E")`;
      case 'waves':
        return `url("data:image/svg+xml,%3Csvg width='40' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q10 0 20 10 Q30 20 40 10' fill='none' stroke='${c}' stroke-opacity='0.12' stroke-width='1.5'/%3E%3C/svg%3E")`;
      case 'lines':
        return `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 L20 10' fill='none' stroke='${c}' stroke-opacity='0.1' stroke-width='0.5'/%3E%3C/svg%3E")`;
      default:
        return 'none';
    }
  }

  stampsArray(total: number): number[] {
    return Array.from({ length: Math.min(total, 10) }, (_, i) => i);
  }

  colorFields = [
    { key: 'background_color', label: 'Couleur de fond' },
    { key: 'foreground_color', label: 'Texte principal' },
    { key: 'label_color',      label: 'Texte secondaire' },
  ];
}

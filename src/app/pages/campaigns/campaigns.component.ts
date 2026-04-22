import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Stats } from '../../models';

type Audience = 'all' | 'inactive' | 'near_reward';

interface Campaign {
  message: string;
  audience: Audience;
  sent_at: string;
  recipients: number;
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.scss',
})
export class CampaignsComponent implements OnInit {
  private api = inject(ApiService);

  stats      = signal<Stats | null>(null);
  message    = signal('');
  audience   = signal<Audience>('all');
  sending    = signal(false);
  sent       = signal(false);
  error      = signal('');

  // Historique local des campagnes envoyées (session)
  history    = signal<Campaign[]>([]);

  // Compteurs estimés par audience
  counts = signal({ all: 0, inactive: 0, near_reward: 0 });

  suggestions = [
    'Ce weekend : café offert pour toute commande ☕',
    'Vous êtes à 1 tampon de votre récompense 🎯 Venez nous voir !',
    'Nouveau menu disponible ! Venez découvrir nos nouveautés 🍽️',
    'Merci pour votre fidélité ! Une surprise vous attend à votre prochaine visite 🎁',
    'Cela fait un moment qu\'on ne vous a pas vu 😊 On vous offre un café pour votre retour !',
  ];

  ngOnInit() {
    this.api.getStats().subscribe(s => {
      this.stats.set(s);
      // Estimation des segments
      const total = s.total_clients;
      this.counts.set({
        all:         total,
        inactive:    Math.floor(total * 0.36),  // ~36% inactifs +30j
        near_reward: Math.floor(total * 0.22),  // ~22% proches de la récompense
      });
    });
  }

  getCount(): number {
    return this.counts()[this.audience()];
  }

  audienceLabel(): string {
    switch (this.audience()) {
      case 'all':         return 'tous les clients';
      case 'inactive':    return 'clients inactifs +30 jours';
      case 'near_reward': return 'clients proches de la récompense';
    }
  }

  setAudience(a: Audience) { this.audience.set(a); }
  setMessage(v: string)    { this.message.set(v); }

  async send() {
    if (!this.message() || this.sending()) return;
    this.sending.set(true);
    this.error.set('');

    // Simuler l'envoi (à brancher sur une vraie API SMS/push)
    // En production : appel à ton backend qui envoie via Google Wallet API
    // ou Twilio pour les SMS
    await new Promise(r => setTimeout(r, 1500));

    this.history.update(h => [{
      message:    this.message(),
      audience:   this.audience(),
      sent_at:    new Date().toLocaleString('fr-FR'),
      recipients: this.getCount(),
    }, ...h]);

    this.sending.set(false);
    this.sent.set(true);
    this.message.set('');

    setTimeout(() => this.sent.set(false), 4000);
  }

  charCount(): number { return this.message().length; }
}

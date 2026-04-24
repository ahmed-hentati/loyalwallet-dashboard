import { Component, inject, signal, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

type Audience = 'all' | 'inactive' | 'near_reward';

interface Campaign {
  message: string;
  audience: Audience;
  sent_at: string;
  recipients: number;
  sms_sent: number;
}

@Component({
  selector: 'app-campaigns',
  standalone: true,
  templateUrl: './campaigns.component.html',
  styleUrl: './campaigns.component.scss',
})
export class CampaignsComponent implements OnInit {
  private api = inject(ApiService);

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
    this.api.getCampaignPreview().subscribe(c => {
      this.counts.set(c);
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

  send() {
    if (!this.message() || this.sending()) return;
    this.sending.set(true);
    this.error.set('');

    this.api.sendCampaign(this.message(), this.audience()).subscribe({
      next: res => {
        this.history.update(h => [{
          message:    this.message(),
          audience:   this.audience(),
          sent_at:    new Date().toLocaleString('fr-FR'),
          recipients: res.sent,
          sms_sent:   res.sms_sent ?? 0,
        }, ...h]);
        this.sending.set(false);
        this.sent.set(true);
        this.message.set('');
        setTimeout(() => this.sent.set(false), 4000);
      },
      error: err => {
        this.error.set(err.error?.error ?? 'Erreur lors de l\'envoi');
        this.sending.set(false);
      },
    });
  }

  charCount(): number { return this.message().length; }
}

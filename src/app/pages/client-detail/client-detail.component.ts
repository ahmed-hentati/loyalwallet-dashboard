import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
})
export class ClientDetailComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private api    = inject(ApiService);

  data      = signal<any>(null);
  loading   = signal(true);
  error     = signal('');

  // Édition téléphone
  editPhone  = signal(false);
  phoneInput = signal('');
  saving     = signal(false);
  saved      = signal(false);

  // Édition nom
  editName   = signal(false);
  nameInput  = signal('');

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.api.getClientDetail(id).subscribe({
      next: res => { this.data.set(res); this.loading.set(false); },
      error: ()  => { this.error.set('Client introuvable'); this.loading.set(false); },
    });
  }

  stampsArray(): number[] {
    const total = this.data()?.card?.stamp_total ?? 10;
    return Array.from({ length: total }, (_, i) => i);
  }

  progressPercent(): number {
    const d = this.data();
    if (!d) return 0;
    if (d.card.loyalty_type === 'stamp') {
      return Math.min(100, (d.holder.stamps / d.card.stamp_total) * 100);
    }
    return Math.min(100, (d.holder.points / d.card.points_for_reward) * 100);
  }

  savePhone() {
    const phone = this.phoneInput().trim();
    if (!phone || this.saving()) return;
    this.saving.set(true);

    this.api.updateClient(this.data().holder.id, { phone }).subscribe({
      next: res => {
        this.data.update(d => ({ ...d, holder: { ...d.holder, phone: res.holder.phone } }));
        this.saving.set(false);
        this.saved.set(true);
        this.editPhone.set(false);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => this.saving.set(false),
    });
  }

  saveName() {
    const name = this.nameInput().trim();
    if (!name || this.saving()) return;
    this.saving.set(true);

    this.api.updateClient(this.data().holder.id, { name }).subscribe({
      next: res => {
        this.data.update(d => ({ ...d, holder: { ...d.holder, name: res.holder.name } }));
        this.saving.set(false);
        this.editName.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  smsSending = signal(false);
  smsDone    = signal(false);

  sendSms() {
    const d = this.data();
    if (!d?.holder?.phone || this.smsSending()) return;
    this.smsSending.set(true);

    this.api.sendClientSms(d.holder.id).subscribe({
      next: () => {
        this.smsSending.set(false);
        this.smsDone.set(true);
        setTimeout(() => this.smsDone.set(false), 3000);
      },
      error: () => this.smsSending.set(false),
    });
  }

  openCardPage() {
    const serial = this.data()?.holder?.serial_number;
    if (serial) window.open(`/card/${serial}`, '_blank');
  }

  goBack() {
    this.router.navigate(['/clients']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-card-page',
  standalone: true,
  templateUrl: './card-page.component.html',
  styleUrl: './card-page.component.scss',
})
export class CardPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http  = inject(HttpClient);

  data             = signal<any>(null);
  loading          = signal(true);
  error            = signal('');
  showBookmarkTip  = signal(false);
  copied           = signal(false);
  pageUrl          = '';

  ngOnInit() {
    const serial = this.route.snapshot.params['serialNumber'];
    this.pageUrl = `${window.location.origin}/card/${serial}`;

    this.http.get<any>(`${environment.apiUrl}/public/holder/${serial}`).subscribe({
      next: res => { this.data.set(res); this.loading.set(false); },
      error: ()  => { this.error.set('Carte introuvable'); this.loading.set(false); },
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

  async copyPageUrl() {
    await navigator.clipboard.writeText(this.pageUrl);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  isIOS(): boolean     { return /iPad|iPhone|iPod/.test(navigator.userAgent); }
  isAndroid(): boolean { return /Android/.test(navigator.userAgent); }
}

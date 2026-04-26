import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-stats',
  standalone: true,
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements OnInit {
  private http = inject(HttpClient);

  data    = signal<any>(null);
  loading = signal(true);

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/clients/analytics/retention`).subscribe({
      next: res => { this.data.set(res); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  trend(value: number): string {
    if (value > 0) return `+${value}%`;
    if (value < 0) return `${value}%`;
    return '=';
  }

  trendClass(value: number): string {
    if (value > 0) return 'trend-up';
    if (value < 0) return 'trend-down';
    return 'trend-neutral';
  }

  // Génère les barres du mini graphe
  chartBars(): { day: string; visits: number; height: number }[] {
    const days = this.data()?.visits_by_day ?? [];
    if (!days.length) return [];
    const max = Math.max(...days.map((d: any) => parseInt(d.visits)));
    return days.map((d: any) => ({
      day: new Date(d.day).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      visits: parseInt(d.visits),
      height: max > 0 ? Math.round((parseInt(d.visits) / max) * 100) : 0,
    }));
  }

  progressPercent(holder: any): number {
    if (holder.loyalty_type === 'stamp') {
      return Math.min(100, (holder.stamps / holder.stamp_total) * 100);
    }
    return Math.min(100, (holder.points / holder.points_for_reward) * 100);
  }
}

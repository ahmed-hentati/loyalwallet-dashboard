import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Stats, Scan } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);

  stats        = signal<Stats | null>(null);
  scans        = signal<Scan[]>([]);
  loadingScans = signal(true);

  ngOnInit() {
    this.api.getStats().subscribe(s => this.stats.set(s));
    this.api.getRecentScans(10).subscribe(s => {
      this.scans.set(s);
      this.loadingScans.set(false);
    });
  }

  formatDate(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1)    return "À l'instant";
    if (diff < 60)   return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private http   = inject(HttpClient);

  // Infos de la carte
  card       = signal<any>(null);
  loading    = signal(true);
  error      = signal('');

  // Formulaire
  name       = signal('');
  phone      = signal('');
  submitting = signal(false);

  // Résultat après inscription
  result     = signal<any>(null);

  private restaurantId = '';
  private cardId = '';

  ngOnInit() {
    this.restaurantId = this.route.snapshot.params['restaurantId'];
    this.cardId       = this.route.snapshot.params['cardId'];

    // Charger les infos de la carte
    this.http.get<any>(`${environment.apiUrl}/public/card/${this.restaurantId}/${this.cardId}`)
      .subscribe({
        next: res => { this.card.set(res.card); this.loading.set(false); },
        error: ()  => { this.error.set('Carte introuvable'); this.loading.set(false); },
      });
  }

  register() {
    if (this.submitting()) return;
    this.submitting.set(true);

    this.http.post<any>(
      `${environment.apiUrl}/public/register/${this.restaurantId}/${this.cardId}`,
      { name: this.name() || undefined, phone: this.phone() || undefined }
    ).subscribe({
      next: res => {
        this.result.set(res);
        this.submitting.set(false);
      },
      error: err => {
        this.error.set(err.error?.error ?? 'Erreur lors de l\'inscription');
        this.submitting.set(false);
      },
    });
  }

  goToCard() {
    if (this.result()) {
      this.router.navigate(['/card', this.result().holder.serial_number]);
    }
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  stampsArray(): number[] {
    const total = this.result()?.card?.stamp_total ?? this.card()?.stamp_total ?? 10;
    return Array.from({ length: total }, (_, i) => i);
  }
}

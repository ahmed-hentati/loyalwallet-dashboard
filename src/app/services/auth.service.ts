import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { Restaurant } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private readonly api = environment.apiUrl;

  readonly restaurant = signal<Restaurant | null>(
    JSON.parse(localStorage.getItem('restaurant') ?? 'null')
  );
  readonly isLoggedIn = computed(() => !!this.restaurant());

  get token() { return localStorage.getItem('token'); }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.api}/auth/login`, { email, password }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(data: { name: string; email: string; password: string; phone?: string }) {
    return this.http.post<any>(`${this.api}/auth/register`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant');
    this.restaurant.set(null);
    this.router.navigate(['/login']);
  }

  private saveSession(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('restaurant', JSON.stringify(res.restaurant));
    this.restaurant.set(res.restaurant);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoyaltyCard, CardHolder, Scan, Stats, ScanResult } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getStats()    { return this.http.get<Stats>(`${this.api}/clients/stats`); }
  getRecentScans(limit = 10) { return this.http.get<Scan[]>(`${this.api}/scans?limit=${limit}`); }
  getCards()    { return this.http.get<LoyaltyCard[]>(`${this.api}/cards`); }

  createCard(data: Partial<LoyaltyCard>)              { return this.http.post<LoyaltyCard>(`${this.api}/cards`, data); }
  updateCard(id: string, data: Partial<LoyaltyCard>)  { return this.http.put<LoyaltyCard>(`${this.api}/cards/${id}`, data); }

  getClients(search?: string, limit = 50, offset = 0) {
    let params = new HttpParams().set('limit', limit).set('offset', offset);
    if (search) params = params.set('search', search);
    return this.http.get<CardHolder[]>(`${this.api}/clients`, { params });
  }

  createPass(cardId: string, name?: string, phone?: string) {
    return this.http.post<any>(`${this.api}/passes/create`, {
      card_id: cardId,
      ...(name  ? { name }  : {}),
      ...(phone ? { phone } : {}),
    });
  }

  scan(serialNumber: string) {
    return this.http.post<ScanResult>(`${this.api}/scans`, { serial_number: serialNumber });
  }
}

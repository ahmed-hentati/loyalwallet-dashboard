import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-automations',
  standalone: true,
  templateUrl: './automations.component.html',
  styleUrl: './automations.component.scss',
})
export class AutomationsComponent implements OnInit {
  private http = inject(HttpClient);

  inactiveEnabled    = signal(false);
  nearRewardEnabled  = signal(false);
  loading            = signal(true);
  saving             = signal(false);
  saved              = signal(false);
  testing            = signal(false);
  testDone           = signal(false);

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/restaurants/automations`).subscribe({
      next: res => {
        this.inactiveEnabled.set(res.automation_inactive_enabled);
        this.nearRewardEnabled.set(res.automation_near_reward_enabled);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggle(type: 'inactive' | 'near_reward') {
    if (type === 'inactive') {
      this.inactiveEnabled.set(!this.inactiveEnabled());
    } else {
      this.nearRewardEnabled.set(!this.nearRewardEnabled());
    }
    this.save();
  }

  save() {
    this.saving.set(true);
    this.http.patch<any>(`${environment.apiUrl}/restaurants/automations`, {
      automation_inactive_enabled:    this.inactiveEnabled(),
      automation_near_reward_enabled: this.nearRewardEnabled(),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2000);
      },
      error: () => this.saving.set(false),
    });
  }

  test() {
    if (this.testing()) return;
    this.testing.set(true);
    this.http.post<any>(`${environment.apiUrl}/restaurants/automations/test`, {}).subscribe({
      next: () => {
        this.testing.set(false);
        this.testDone.set(true);
        setTimeout(() => this.testDone.set(false), 4000);
      },
      error: () => this.testing.set(false),
    });
  }
}

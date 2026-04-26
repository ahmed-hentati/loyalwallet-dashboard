import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  auth = inject(AuthService);

  links = [
    { path: '/dashboard',   icon: '📊', label: 'Dashboard'   },
    { path: '/stats',       icon: '📈', label: 'Statistiques' },
    { path: '/scanner',   icon: '📷', label: 'Scanner'    },
    { path: '/cards',     icon: '🎴', label: 'Mes cartes' },
    { path: '/clients',   icon: '👥', label: 'Clients'    },
    { path: '/campaigns',   icon: '📣', label: 'Campagnes'    },
    { path: '/automations', icon: '⚡', label: 'Automations'  },
    { path: '/print-qr',   icon: '🖨️', label: 'Imprimer QR'  },
    { path: '/settings',   icon: '⚙️', label: 'Paramètres'   },
  ];

  get publicPageUrl(): string {
    const slug = this.auth.restaurant()?.slug;
    return slug ? `/restaurant/${slug}` : '';
  }
}

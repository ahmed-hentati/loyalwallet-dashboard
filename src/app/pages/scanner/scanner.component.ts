import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ScanResult, LoyaltyCard } from '../../models';

@Component({
  selector: 'app-scanner',
  standalone: true,
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss',
})
export class ScannerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  private api = inject(ApiService);
  private stream: MediaStream | null = null;
  private animFrame: number | null = null;
  private lastScanned = '';
  private scanCooldown = false;

  // ── Caméra ────────────────────────────────────────────────
  cameraActive  = signal(false);
  cameraError   = signal('');
  cameraLoading = signal(false);

  // ── Scan ──────────────────────────────────────────────────
  loading = signal(false);
  result  = signal<ScanResult | null>(null);
  error   = signal('');

  // ── Nouveau client ────────────────────────────────────────
  showNewClient = signal(false);
  cards         = signal<LoyaltyCard[]>([]);
  creating      = signal(false);
  createResult  = signal<any>(null);

  ngOnInit() {
    this.api.getCards().subscribe(c => this.cards.set(c));
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.stopCamera();
  }

  // ── Caméra ────────────────────────────────────────────────
  async toggleCamera() {
    if (this.cameraActive()) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  async startCamera() {
    this.cameraError.set('');
    this.cameraLoading.set(true);

    try {
      // Préférer la caméra arrière sur mobile
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      this.cameraActive.set(true);

      // Attendre que le DOM soit prêt
      setTimeout(() => {
        const video = this.videoEl?.nativeElement;
        if (video) {
          video.srcObject = this.stream;
          video.play();
          video.onloadedmetadata = () => {
            this.cameraLoading.set(false);
            this.startQrDetection();
          };
        }
      }, 100);

    } catch (err: any) {
      this.cameraLoading.set(false);
      if (err.name === 'NotAllowedError') {
        this.cameraError.set('Accès à la caméra refusé. Autorisez l\'accès dans les réglages de votre navigateur.');
      } else if (err.name === 'NotFoundError') {
        this.cameraError.set('Aucune caméra trouvée sur cet appareil.');
      } else {
        this.cameraError.set('Impossible d\'accéder à la caméra : ' + err.message);
      }
    }
  }

  stopCamera() {
    if (this.animFrame) { cancelAnimationFrame(this.animFrame); this.animFrame = null; }
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    this.cameraActive.set(false);
    this.cameraLoading.set(false);
  }

  // ── Détection QR ──────────────────────────────────────────
  private startQrDetection() {
    // Utiliser BarcodeDetector si disponible (Chrome, Safari 17+)
    if ('BarcodeDetector' in window) {
      this.detectWithBarcodeDetector();
    } else {
      // Fallback : ZXing via import dynamique
      this.detectWithZxing();
    }
  }

  private async detectWithBarcodeDetector() {
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
    const video = this.videoEl?.nativeElement;
    if (!video) return;

    const scan = async () => {
      if (!this.cameraActive()) return;
      try {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0 && !this.scanCooldown) {
            this.onQrDetected(barcodes[0].rawValue);
          }
        }
      } catch {}
      this.animFrame = requestAnimationFrame(scan);
    };
    this.animFrame = requestAnimationFrame(scan);
  }

  private async detectWithZxing() {
    // Fallback canvas-based scan avec @zxing/library
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const video = this.videoEl?.nativeElement;
      if (!video || !this.stream) return;

      const reader = new BrowserQRCodeReader();
      const scanLoop = async () => {
        if (!this.cameraActive()) return;
        try {
          const canvas = this.canvasEl?.nativeElement;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const result = await reader.decodeFromCanvas(canvas);
            if (result && !this.scanCooldown) {
              this.onQrDetected(result.getText());
            }
          }
        } catch {}
        this.animFrame = requestAnimationFrame(scanLoop);
      };
      this.animFrame = requestAnimationFrame(scanLoop);
    } catch {
      this.cameraError.set('Scanner QR non supporté sur ce navigateur. Utilisez la saisie manuelle.');
      this.stopCamera();
    }
  }

  private onQrDetected(raw: string) {
    if (this.scanCooldown || this.loading()) return;
    this.scanCooldown = true;
    setTimeout(() => this.scanCooldown = false, 3000);

    // Extraire serial depuis URL ou utiliser directement
    let serial = raw;
    if (raw.includes('serial=')) {
      serial = raw.split('serial=')[1].split('&')[0];
    }

    this.stopCamera();
    this.doScan(serial);
  }

  // ── Scan ──────────────────────────────────────────────────
  doScan(serial: string) {
    if (!serial || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.api.scan(serial.toUpperCase()).subscribe({
      next: res  => { this.result.set(res);  this.loading.set(false); },
      error: err => { this.error.set(err.error?.error ?? 'Carte introuvable'); this.loading.set(false); },
    });
  }

  reset() {
    this.result.set(null);
    this.error.set('');
    this.lastScanned = '';
  }

  range(n: number) { return Array.from({ length: n }, (_, i) => i); }

  // ── Nouveau client ────────────────────────────────────────
  createClient(cardId: string, name: string, phone: string) {
    if (!cardId) return;
    this.creating.set(true);
    this.api.createPass(cardId, name || undefined, phone || undefined).subscribe({
      next: res => { this.createResult.set(res); this.creating.set(false); },
      error: () => this.creating.set(false),
    });
  }

  closeNewClient() {
    this.showNewClient.set(false);
    this.createResult.set(null);
  }
}

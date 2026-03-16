import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { SituationGlobale } from '../../models/elevage.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  situation: SituationGlobale | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private lotService: LotService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.loadSituation(), 0);
    }
  }

  loadSituation() {
    this.loading = true;
    this.lotService.getSituationGlobale().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.situation = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Impossible de charger la situation financière';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR');
  }
}

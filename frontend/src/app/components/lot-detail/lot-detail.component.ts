import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LotService } from '../../services/lot.service';
import { PoidsActuelResponse } from '../../models/elevage.model';

@Component({
  selector: 'app-lot-detail',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lot-detail.component.html',
  styleUrl: './lot-detail.component.css'
})
export class LotDetailComponent implements OnInit {
  lot: PoidsActuelResponse | null = null;
  loading = false;
  error: string | null = null;
  selectedDate = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private lotService: LotService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (Number.isFinite(id) && id > 0) {
        this.loadLot(id);
      }
    });
  }

  loadLot(id: number) {
    this.loading = true;
    this.error = null;
    this.lotService.getPoidsActuel(id, this.selectedDate).subscribe({
      next: (response) => {
        this.lot = response.success && response.data ? response.data : null;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les détails du lot.';
        this.loading = false;
      }
    });
  }

  reload() {
    if (!this.lot) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id > 0) {
        this.loadLot(id);
      }
      return;
    }
    this.loadLot(this.lot.id_lot);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('fr-FR');
  }

  formatNumber(value: number): string {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }
}

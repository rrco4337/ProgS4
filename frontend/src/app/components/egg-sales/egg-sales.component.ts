import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VenteOeufService } from '../../services/vente-oeuf.service';
import { LotService } from '../../services/lot.service';
import { OeufService, StockOeuf } from '../../services/oeuf.service';

@Component({
  selector: 'app-egg-sales',
  imports: [CommonModule, FormsModule],
  templateUrl: './egg-sales.component.html',
  styleUrl: './egg-sales.component.css'
})
export class EggSalesComponent implements OnInit {
  ventes: any[] = [];
  lots: any[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  filterLot = 'all';
  filterDateFrom = '';

  showCreateForm = false;
  stockInfo: StockOeuf | null = null;

  newSale = {
    id_lot: 0,
    date_vente: new Date().toISOString().split('T')[0],
    nombre_oeufs: 1,
    prix_unitaire: 500
  };

  constructor(
    private venteService: VenteOeufService,
    private lotService: LotService,
    private oeufService: OeufService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadAll();

    if (this.route.snapshot.routeConfig?.path === 'egg-sales/new') {
      this.openCreateForm();
    }
  }

  loadAll() {
    this.loading = true;
    this.error = null;
    this.venteService.getAll().subscribe({
      next: (res) => {
        this.ventes = res.success && res.data ? res.data : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les ventes.';
        this.loading = false;
      }
    });

    this.lotService.getAll().subscribe({
      next: (res) => {
        this.lots = res.success && res.data ? res.data : [];
        if (!this.newSale.id_lot && this.lots.length > 0) {
          this.newSale.id_lot = this.lots[0].id_lot;
          this.loadStock();
        }
      }
    });
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.successMessage = null;
    this.error = null;
    this.newSale = {
      id_lot: this.lots.length > 0 ? this.lots[0].id_lot : 0,
      date_vente: new Date().toISOString().split('T')[0],
      nombre_oeufs: 1,
      prix_unitaire: 500
    };
    this.loadStock();
  }

  loadStock() {
    if (!this.newSale.id_lot) {
      this.stockInfo = null;
      return;
    }
    this.oeufService.getStockByLot(this.newSale.id_lot).subscribe({
      next: (res) => {
        this.stockInfo = res.success && res.data ? res.data : null;
      },
      error: () => {
        this.stockInfo = null;
      }
    });
  }

  get stockInsuffisant(): boolean {
    return !!this.stockInfo && this.newSale.nombre_oeufs > this.stockInfo.stock_disponible;
  }

  createSale() {
    if (this.stockInsuffisant) {
      this.error = 'Stock insuffisant pour valider la vente.';
      return;
    }
    this.loading = true;
    this.venteService.create(this.newSale).subscribe({
      next: (res) => {
        if (res.success) {
          this.showCreateForm = false;
          this.successMessage = 'Vente enregistrée avec succès.';
          this.loadAll();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Erreur lors de la création de la vente.';
        this.loading = false;
      }
    });
  }

  deleteSale(id: number) {
    if (!confirm('Supprimer cette vente ?')) {
      return;
    }
    this.venteService.delete(id).subscribe({
      next: () => this.loadAll(),
      error: () => {
        this.error = 'Erreur lors de la suppression de la vente.';
      }
    });
  }

  get filteredSales() {
    return this.ventes.filter((sale) => {
      const byLot = this.filterLot === 'all' || String(sale.id_lot) === this.filterLot;
      const byDate = !this.filterDateFrom || new Date(sale.date_vente) >= new Date(this.filterDateFrom);
      return byLot && byDate;
    });
  }

  get totalRevenue() {
    return this.filteredSales.reduce((sum, sale) => sum + (sale.revenu_total || 0), 0);
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('fr-FR');
  }

  formatNumber(value: number): string {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }
}

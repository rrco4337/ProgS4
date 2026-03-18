import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncubationService } from '../../services/incubation.service';
import { OeufService } from '../../services/oeuf.service';

type StatutFilter = 'all' | 'en_cours' | 'eclot' | 'eclot_auto';

@Component({
  selector: 'app-incubation-batches',
  imports: [CommonModule, FormsModule],
  templateUrl: './incubation-batches.component.html',
  styleUrl: './incubation-batches.component.css'
})
export class IncubationBatchesComponent implements OnInit {
  incubations: any[] = [];
  oeufs: any[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  filterStatus: StatutFilter = 'all';
  showCreateForm = false;
  showHatchForm = false;

  newBatch = {
    id_oeuf: 0,
    date_debut: new Date().toISOString().split('T')[0],
    nombre_oeufs: 1
  };

  hatchData = {
    id_incubation: 0,
    oeufs_pourris: 0,
    pourcentage_male: 50
  };

  constructor(
    private incubationService: IncubationService,
    private oeufService: OeufService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = null;
    this.incubationService.getAll().subscribe({
      next: (res) => {
        this.incubations = res.success && res.data ? res.data : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les incubations.';
        this.loading = false;
      }
    });

    this.oeufService.getAll().subscribe({
      next: (res) => {
        this.oeufs = res.success && res.data ? res.data : [];
        if (!this.newBatch.id_oeuf && this.oeufs.length > 0) {
          this.newBatch.id_oeuf = this.oeufs[0].id_oeuf;
        }
      }
    });
  }

  get filteredIncubations() {
    if (this.filterStatus === 'all') {
      return this.incubations;
    }
    return this.incubations.filter((item) => item.statut === this.filterStatus);
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.successMessage = null;
    this.error = null;
    this.newBatch = {
      id_oeuf: this.oeufs.length > 0 ? this.oeufs[0].id_oeuf : 0,
      date_debut: new Date().toISOString().split('T')[0],
      nombre_oeufs: 1
    };
  }

  createBatch() {
    this.loading = true;
    this.incubationService.create(this.newBatch).subscribe({
      next: (res) => {
        if (res.success) {
          this.showCreateForm = false;
          this.successMessage = 'Batch d’incubation créé.';
          this.loadAll();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Erreur lors de la création du batch.';
        this.loading = false;
      }
    });
  }

  openHatchForm(batch: any) {
    this.showHatchForm = true;
    this.hatchData = {
      id_incubation: batch.id_incubation,
      oeufs_pourris: 0,
      pourcentage_male: 50
    };
  }

  confirmHatch() {
    this.loading = true;
    this.incubationService.ecloter(this.hatchData.id_incubation, {
      oeufs_pourris: this.hatchData.oeufs_pourris,
      pourcentage_male: this.hatchData.pourcentage_male
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showHatchForm = false;
          this.successMessage = 'Éclosion confirmée et lot résultant créé.';
          this.loadAll();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Erreur lors de l’éclosion.';
        this.loading = false;
      }
    });
  }

  deleteBatch(id: number) {
    if (!confirm('Supprimer ce batch ?')) {
      return;
    }
    this.incubationService.delete(id).subscribe({
      next: () => this.loadAll(),
      error: () => {
        this.error = 'Erreur lors de la suppression du batch.';
      }
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('fr-FR');
  }
}

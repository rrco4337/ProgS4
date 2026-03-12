import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LotService } from '../../services/lot.service';
import { RaceService } from '../../services/race.service';
import { OeufService } from '../../services/oeuf.service';
import { Lot, Race, PoidsActuelResponse, Oeuf } from '../../models/elevage.model';

@Component({
  selector: 'app-lot-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './lot-list.component.html',
  styleUrls: ['./lot-list.component.css']
})
export class LotListComponent implements OnInit {
  lots: Lot[] = [];
  races: Race[] = [];
  selectedLot: PoidsActuelResponse | null = null;
  selectedLotCard: Lot | null = null;
  oeufsLot: Oeuf[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  selectedDate = '';

  newLot: Partial<Lot> = {
    id_race: 0,
    date_entree: '',
    nombre_initial: 0,
    cout_achat: 0
  };

  editingLot: Lot | null = null;

  constructor(
    private lotService: LotService,
    private raceService: RaceService,
    private oeufService: OeufService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.selectedDate = this.getTodayIsoDate();
        this.loadLots();
        this.loadRaces();
      }, 0);
    }
  }

  get filteredLots(): Lot[] {
    if (!this.selectedDate) {
      return this.lots;
    }

    return this.lots.filter((lot) => lot.date_entree <= this.selectedDate);
  }

  loadLots() {
    this.loading = true;
    this.lotService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lots = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des lots';
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadRaces() {
    this.raceService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.races = response.data;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des races:', err);
      }
    });
  }

  openCreateForm() {
    this.showCreateForm = true;
    const today = this.getTodayIsoDate();
    this.newLot = {
      id_race: this.races.length > 0 ? this.races[0].id_race : 0,
      date_entree: today,
      nombre_initial: 100,
      cout_achat: 5000
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
  }

  createLot() {
    this.loading = true;
    this.lotService.create(this.newLot).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadLots();
          this.closeCreateForm();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la création';
        console.error(err);
        this.loading = false;
      }
    });
  }

  openEditForm(lot: Lot) {
    this.editingLot = { ...lot };
    this.showEditForm = true;
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingLot = null;
  }

  updateLot() {
    if (!this.editingLot) return;

    this.loading = true;
    this.lotService.update(this.editingLot.id_lot, this.editingLot).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadLots();
          this.closeEditForm();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour';
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteLot(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      this.loading = true;
      this.lotService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadLots();
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  viewDetails(lot: Lot) {
    this.selectedLotCard = lot;
    this.loadLotDetails(lot.id_lot);
  }

  loadLotDetails(idLot: number) {
    this.loading = true;
    this.error = null;
    this.oeufsLot = [];
    this.lotService.getPoidsActuel(idLot, this.selectedDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedLot = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des détails';
        console.error(err);
        this.loading = false;
      }
    });
    // Charger les récoltes d'œufs du lot (relation LOT ↔ ŒUFS)
    this.oeufService.getByLot(idLot, this.selectedDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Trier par date ascendante pour affichage chronologique
          this.oeufsLot = response.data.sort(
            (a, b) => new Date(a.date_recolte).getTime() - new Date(b.date_recolte).getTime()
          );
        }
      },
      error: () => { this.oeufsLot = []; }
    });
  }

  onSelectedDateChange() {
    if (this.selectedLotCard && this.selectedLotCard.date_entree > this.selectedDate) {
      this.closeDetails();
      this.error = 'Le lot sélectionné n’existait pas encore à cette date.';
      return;
    }

    if (this.selectedLotCard) {
      this.loadLotDetails(this.selectedLotCard.id_lot);
    }
  }

  resetSelectedDate() {
    this.selectedDate = this.getTodayIsoDate();
    this.onSelectedDateChange();
  }

  closeDetails() {
    this.selectedLot = null;
    this.selectedLotCard = null;
    this.oeufsLot = [];
  }

  /** Cumul des œufs du lot jusqu'à la ligne i (inclus) */
  getCumulOeufs(upToIndex: number): number {
    return this.oeufsLot
      .slice(0, upToIndex + 1)
      .reduce((sum, o) => sum + o.nombre, 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private getTodayIsoDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}

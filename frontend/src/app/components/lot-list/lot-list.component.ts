import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
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
  oeufsLot: Oeuf[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  selectedDate: string = '';

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
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setToday();
      setTimeout(() => {
        this.loadLots();
        this.loadRaces();
      }, 0);
    }
  }

  loadLots() {
    this.loading = true;
    this.lotService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lots = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des lots';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadRaces() {
    this.raceService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.races = response.data;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des races:', err);
        this.cdr.detectChanges();
      }
    });
  }

  openCreateForm() {
    this.showCreateForm = true;
    const today = new Date().toISOString().split('T')[0];
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la création';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la mise à jour';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
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
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          console.error(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  viewDetails(lot: Lot) {
    this.loading = true;
    this.oeufsLot = [];
    
    // Utiliser la date sélectionnée pour le calcul de la situation
    this.lotService.getPoidsActuel(lot.id_lot, this.selectedDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedLot = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des détails';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    
    // Charger les récoltes d'œufs du lot jusqu'à la date sélectionnée
    this.oeufService.getByLot(lot.id_lot).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filtrer les œufs jusqu'à la date sélectionnée et trier par date ascendante
          this.oeufsLot = response.data
            .filter(oeuf => new Date(oeuf.date_recolte) <= new Date(this.selectedDate))
            .sort((a, b) => new Date(a.date_recolte).getTime() - new Date(b.date_recolte).getTime());
        }
        this.cdr.detectChanges();
      },
      error: () => { this.oeufsLot = []; this.cdr.detectChanges(); }
    });
  }

  closeDetails() {
    this.selectedLot = null;
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

  setToday() {
    this.selectedDate = new Date().toISOString().split('T')[0];
    if (this.selectedLot) {
      this.refreshLotDetails();
    }
  }

  onDateChange() {
    if (this.selectedLot) {
      this.refreshLotDetails();
    }
  }

  refreshLotDetails() {
    if (!this.selectedLot) return;
    
    const lotId = this.selectedLot.id_lot;
    this.loading = true;
    // Recharger les détails avec la nouvelle date
    this.lotService.getPoidsActuel(lotId, this.selectedDate).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.selectedLot = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du rechargement des détails';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    
    // Recharger aussi les œufs filtrés jusqu'à la date sélectionnée
    this.oeufService.getByLot(lotId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filtrer les œufs jusqu'à la date sélectionnée
          this.oeufsLot = response.data
            .filter(oeuf => new Date(oeuf.date_recolte) <= new Date(this.selectedDate))
            .sort((a, b) => new Date(a.date_recolte).getTime() - new Date(b.date_recolte).getTime());
        }
        this.cdr.detectChanges();
      },
      error: () => { this.oeufsLot = []; this.cdr.detectChanges(); }
    });
  }
}

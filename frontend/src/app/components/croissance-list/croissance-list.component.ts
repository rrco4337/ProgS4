import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CroissanceService } from '../../services/croissance.service';
import { RaceService } from '../../services/race.service';
import { Croissance, Race } from '../../models/elevage.model';

@Component({
  selector: 'app-croissance-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './croissance-list.component.html',
  styleUrls: ['./croissance-list.component.css']
})
export class CroissanceListComponent implements OnInit {
  croissances: Croissance[] = [];
  races: Race[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  selectedRaceId: number | null = null;
  croissancesByRace: { [key: number]: Croissance[] } = {};

  newCroissance: Partial<Croissance> = {
    id_race: 0,
    semaine: 0,
    gain_poids: 0,
    nourriture: 0
  };

  editingCroissance: Croissance | null = null;

  constructor(
    private croissanceService: CroissanceService,
    private raceService: RaceService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadRaces();
        this.loadCroissances();
      }, 0);
    }
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

  loadCroissances() {
    this.loading = true;
    this.error = null;
    this.croissanceService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.croissances = response.data;
          this.groupByRace();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des données';
        console.error(err);
        this.loading = false;
      }
    });
  }

  groupByRace() {
    this.croissancesByRace = {};
    this.croissances.forEach(c => {
      if (!this.croissancesByRace[c.id_race]) {
        this.croissancesByRace[c.id_race] = [];
      }
      this.croissancesByRace[c.id_race].push(c);
    });

    // Trier par semaine
    Object.keys(this.croissancesByRace).forEach(raceId => {
      this.croissancesByRace[+raceId].sort((a, b) => a.semaine - b.semaine);
    });
  }

  selectRace(raceId: number) {
    this.selectedRaceId = this.selectedRaceId === raceId ? null : raceId;
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.newCroissance = {
      id_race: this.races.length > 0 ? this.races[0].id_race : 0,
      semaine: 0,
      gain_poids: 0,
      nourriture: 0
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
  }

  createCroissance() {
    this.loading = true;
    this.croissanceService.create(this.newCroissance).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCroissances();
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

  openEditForm(croissance: Croissance) {
    this.editingCroissance = { ...croissance };
    this.showEditForm = true;
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingCroissance = null;
  }

  updateCroissance() {
    if (!this.editingCroissance) return;

    this.loading = true;
    this.croissanceService.update(this.editingCroissance.id_croissance, this.editingCroissance).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCroissances();
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

  deleteCroissance(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette donnée de croissance ?')) {
      this.loading = true;
      this.croissanceService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadCroissances();
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

  getRaceName(raceId: number): string {
    const race = this.races.find(r => r.id_race === raceId);
    return race ? race.nom_race : `Race #${raceId}`;
  }

  getTotalWeight(raceId: number): number {
    if (!this.croissancesByRace[raceId]) return 0;
    return this.croissancesByRace[raceId].reduce((sum, c) => sum + c.gain_poids, 0);
  }

  getTotalFood(raceId: number): number {
    if (!this.croissancesByRace[raceId]) return 0;
    return this.croissancesByRace[raceId].reduce((sum, c) => sum + c.nourriture, 0);
  }
}

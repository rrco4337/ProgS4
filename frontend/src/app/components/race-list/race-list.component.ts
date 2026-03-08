import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RaceService } from '../../services/race.service';
import { CroissanceService } from '../../services/croissance.service';
import { Race, Croissance } from '../../models/elevage.model';

@Component({
  selector: 'app-race-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './race-list.component.html',
  styleUrls: ['./race-list.component.css']
})
export class RaceListComponent implements OnInit {
  races: Race[] = [];
  selectedRace: Race | null = null;
  croissanceData: Croissance[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  showEditForm = false;

  newRace: Partial<Race> = {
    nom_race: '',
    pu_sakafo_g: 0,
    pv_g: 0,
    pv_oeuf: 0,
    semaine_debut_ponte: 0,
    duree_incubation: 21
  };

  editRace: Partial<Race> = {};

  constructor(
    private raceService: RaceService,
    private croissanceService: CroissanceService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadRaces();
      }, 0);
    }
  }

  loadRaces() {
    this.loading = true;
    this.error = null;
    this.raceService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.races = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des races';
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewCroissance(race: Race) {
    this.selectedRace = race;
    this.loading = true;
    this.croissanceService.getByRace(race.id_race).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.croissanceData = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la croissance';
        console.error(err);
        this.loading = false;
      }
    });
  }

  closeDetails() {
    this.selectedRace = null;
    this.croissanceData = [];
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.newRace = {
      nom_race: '',
      pu_sakafo_g: 0,
      pv_g: 0,
      pv_oeuf: 0,
      semaine_debut_ponte: 20,
      duree_incubation: 21
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
  }

  createRace() {
    this.loading = true;
    this.raceService.create(this.newRace).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadRaces();
          this.closeCreateForm();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la création de la race';
        console.error(err);
        this.loading = false;
      }
    });
  }

  openEditForm(race: Race) {
    this.editRace = { ...race };
    this.showEditForm = true;
  }

  closeEditForm() {
    this.showEditForm = false;
  }

  updateRace() {
    if (this.editRace.id_race) {
      this.loading = true;
      this.raceService.update(this.editRace.id_race, this.editRace).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRaces();
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
  }

  deleteRace(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette race ?')) {
      this.loading = true;
      this.raceService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadRaces();
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
}

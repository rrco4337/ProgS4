import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
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
    pv_g: 15,
    pv_g_femelle: 15,
    pv_g_male: 20,
    pv_oeuf: 0,
    semaine_debut_ponte: 0,
    duree_incubation: 21,
    capacite_ponte: 300
  };

  editRace: Partial<Race> = {};

  constructor(
    private raceService: RaceService,
    private croissanceService: CroissanceService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.loadRaces(), 0);
    }
  }

  loadRaces() {
    console.log('[RaceListComponent] Starting loadRaces...');
    this.loading = true;
    this.error = null;
    this.raceService.getAll().subscribe({
      next: (response) => {
        console.log('[RaceListComponent] Received response:', response);
        if (response.success && response.data) {
          this.races = response.data;
          console.log('[RaceListComponent] Loaded races:', this.races.length);
        } else {
          console.warn('[RaceListComponent] Response not successful or no data');
          this.error = 'Aucune donnée reçue du serveur';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[RaceListComponent] Error loading races:', err);
        this.error = 'Erreur lors du chargement des races';
        this.loading = false;
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la croissance';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
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
      pv_g: 15,
      pv_g_femelle: 15,
      pv_g_male: 20,
      pv_oeuf: 0,
      semaine_debut_ponte: 20,
      duree_incubation: 21,
      capacite_ponte: 300
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la création de la race';
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
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
}

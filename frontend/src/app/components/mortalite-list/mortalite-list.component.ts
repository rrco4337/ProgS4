import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MortaliteService } from '../../services/mortalite.service';
import { LotService } from '../../services/lot.service';
import { Mortalite, Lot } from '../../models/elevage.model';

@Component({
  selector: 'app-mortalite-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './mortalite-list.component.html',
  styleUrls: ['./mortalite-list.component.css']
})
export class MortaliteListComponent implements OnInit {
  mortalites: any[] = [];
  lots: Lot[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;

  newMortalite: Partial<Mortalite> = {
    id_lot: 0,
    date_mort: '',
    nombre: 0
  };

  constructor(
    private mortaliteService: MortaliteService,
    private lotService: LotService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadMortalites();
        this.loadLots();
      }, 0);
    }
  }

  loadMortalites() {
    this.loading = true;
    this.error = null;
    this.mortaliteService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.mortalites = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des mortalités';
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadLots() {
    this.lotService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.lots = response.data;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des lots:', err);
      }
    });
  }

  openCreateForm() {
    this.showCreateForm = true;
    const today = new Date().toISOString().split('T')[0];
    this.newMortalite = {
      id_lot: this.lots.length > 0 ? this.lots[0].id_lot : 0,
      date_mort: today,
      nombre: 1
    };
  }

  closeCreateForm() {
    this.showCreateForm = false;
  }

  createMortalite() {
    this.loading = true;
    this.mortaliteService.create(this.newMortalite).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadMortalites();
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

  deleteMortalite(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      this.loading = true;
      this.mortaliteService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMortalites();
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
}

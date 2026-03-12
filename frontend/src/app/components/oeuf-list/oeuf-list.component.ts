import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OeufService } from '../../services/oeuf.service';
import { IncubationService } from '../../services/incubation.service';
import { VenteOeufService } from '../../services/vente-oeuf.service';
import { LotService } from '../../services/lot.service';
import { Oeuf, Incubation, VenteOeuf, Lot } from '../../models/elevage.model';

@Component({
  selector: 'app-oeuf-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './oeuf-list.component.html',
  styleUrls: ['./oeuf-list.component.css']
})
export class OeufListComponent implements OnInit {
  // Onglet actif
  activeTab: 'recolte' | 'incubation' | 'ventes' = 'recolte';

  // Données
  oeufs: any[] = [];
  incubations: any[] = [];
  ventes: any[] = [];
  lots: Lot[] = [];

  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Formulaires
  showRecolteForm = false;
  showIncubationForm = false;
  showVenteForm = false;

  newRecolte: Partial<Oeuf> = { id_lot: 0, date_recolte: '', nombre: 0 };
  newIncubation: { id_oeuf: number; date_debut: string; nombre_oeufs: number } = {
    id_oeuf: 0, date_debut: '', nombre_oeufs: 0
  };
  newVente: { id_lot: number; date_vente: string; nombre_oeufs: number; prix_unitaire: number } = {
    id_lot: 0, date_vente: '', nombre_oeufs: 0, prix_unitaire: 500
  };

  constructor(
    private oeufService: OeufService,
    private incubationService: IncubationService,
    private venteService: VenteOeufService,
    private lotService: LotService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadLots();
        this.loadOeufs();
        this.loadIncubations();
        this.loadVentes();
      }, 0);
    }
  }

  setTab(tab: 'recolte' | 'incubation' | 'ventes') {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
  }

  // ─── Chargement ───────────────────────────────────────────

  loadLots() {
    this.lotService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.lots = res.data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Erreur chargement lots:', err); this.cdr.detectChanges(); }
    });
  }

  loadOeufs() {
    this.loading = true;
    this.oeufService.getAll().subscribe({
      next: (res) => {
        if (res.success && res.data) this.oeufs = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => { this.error = 'Erreur chargement récoltes'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadIncubations() {
    this.incubationService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.incubations = res.data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Erreur chargement incubations:', err); this.cdr.detectChanges(); }
    });
  }

  loadVentes() {
    this.venteService.getAll().subscribe({
      next: (res) => { if (res.success && res.data) this.ventes = res.data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Erreur chargement ventes:', err); this.cdr.detectChanges(); }
    });
  }

  // ─── Récolte d'oeufs ──────────────────────────────────────

  openRecolteForm() {
    const today = new Date().toISOString().split('T')[0];
    this.newRecolte = {
      id_lot: this.lots.length > 0 ? this.lots[0].id_lot : 0,
      date_recolte: today,
      nombre: 1
    };
    this.showRecolteForm = true;
  }

  cancelRecolteForm() {
    this.showRecolteForm = false;
  }

  createRecolte() {
    this.loading = true;
    this.oeufService.create(this.newRecolte).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadOeufs();
          this.showRecolteForm = false;
          this.successMessage = 'Récolte enregistrée !';
          setTimeout(() => { this.successMessage = null; this.cdr.detectChanges(); }, 3000);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => { this.error = 'Erreur création récolte'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  deleteRecolte(id: number) {
    if (confirm('Supprimer cette récolte ?')) {
      this.oeufService.delete(id).subscribe({
        next: () => { this.loadOeufs(); this.cdr.detectChanges(); },
        error: (err) => { this.error = 'Erreur suppression'; this.cdr.detectChanges(); }
      });
    }
  }

  // ─── Incubation ────────────────────────────────────────────

  openIncubationForm() {
    const today = new Date().toISOString().split('T')[0];
    this.newIncubation = {
      id_oeuf: this.oeufs.length > 0 ? this.oeufs[0].id_oeuf : 0,
      date_debut: today,
      nombre_oeufs: 0
    };
    this.showIncubationForm = true;
  }

  cancelIncubationForm() {
    this.showIncubationForm = false;
  }

  createIncubation() {
    if (this.incubationStockInsuffisant || this.stockPourIncubation <= 0) {
      this.error = `Stock insuffisant. Stock disponible : ${this.stockPourIncubation} œuf(s).`;
      return;
    }
    this.loading = true;
    this.incubationService.create(this.newIncubation).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadIncubations();
          this.showIncubationForm = false;
          this.successMessage = 'Incubation démarrée !';
          setTimeout(() => { this.successMessage = null; this.cdr.detectChanges(); }, 3000);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.error || 'Erreur création incubation';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ecloterIncubation(id: number) {
    if (confirm('Confirmer l\'éclosion et créer le nouveau lot de poussins ?')) {
      this.incubationService.ecloter(id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.loadIncubations();
            this.loadLots();
            this.successMessage = `✅ Éclosion confirmée ! Lot #${res.data.id_lot_resultat} créé avec ${res.data.nombre_poussins} poussins.`;
            setTimeout(() => { this.successMessage = null; this.cdr.detectChanges(); }, 6000);
          }
          this.cdr.detectChanges();
        },
        error: (err) => { this.error = 'Erreur lors de l\'\u00e9closion'; this.cdr.detectChanges(); }
      });
    }
  }

  deleteIncubation(id: number) {
    if (confirm('Supprimer cette incubation ?')) {
      this.incubationService.delete(id).subscribe({
        next: () => { this.loadIncubations(); this.cdr.detectChanges(); },
        error: (err) => { this.error = 'Erreur suppression'; this.cdr.detectChanges(); }
      });
    }
  }

  // ─── Ventes d'oeufs ────────────────────────────────────────

  openVenteForm() {
    const today = new Date().toISOString().split('T')[0];
    this.newVente = {
      id_lot: this.lots.length > 0 ? this.lots[0].id_lot : 0,
      date_vente: today,
      nombre_oeufs: 0,
      prix_unitaire: 500
    };
    this.showVenteForm = true;
  }

  cancelVenteForm() {
    this.showVenteForm = false;
  }

  createVente() {
    if (this.venteStockInsuffisant || this.stockPourVente <= 0) {
      this.error = `Stock insuffisant. Stock disponible : ${this.stockPourVente} œuf(s).`;
      return;
    }
    this.loading = true;
    this.venteService.create(this.newVente).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadVentes();
          this.showVenteForm = false;
          const revenu = this.newVente.nombre_oeufs * this.newVente.prix_unitaire;
          this.successMessage = `Vente enregistrée ! Revenu : ${revenu.toLocaleString('fr-FR')} Ar`;
          setTimeout(() => { this.successMessage = null; this.cdr.detectChanges(); }, 4000);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.error || 'Erreur création vente';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteVente(id: number) {
    if (confirm('Supprimer cette vente ?')) {
      this.venteService.delete(id).subscribe({
        next: () => { this.loadVentes(); this.cdr.detectChanges(); },
        error: (err) => { this.error = 'Erreur suppression'; this.cdr.detectChanges(); }
      });
    }
  }

  // ─── Utilitaires ───────────────────────────────────────────

  get totalOeufsRecoltes(): number {
    return this.oeufs.reduce((sum, o) => sum + o.nombre, 0);
  }

  get totalOeufsIncubes(): number {
    return this.incubations.reduce((sum, i) => sum + i.nombre_oeufs, 0);
  }

  get totalOeufsVendus(): number {
    return this.ventes.reduce((sum, v) => sum + v.nombre_oeufs, 0);
  }

  get totalRevenuVentes(): number {
    return this.ventes.reduce((sum, v) => sum + (v.revenu_total || 0), 0);
  }

  get revenuVentePrevu(): number {
    return this.newVente.nombre_oeufs * this.newVente.prix_unitaire;
  }

  // ─── Stock disponible ────────────────────────────────────────

  /** Calcule le stock dispo pour un lot à partir des données déjà chargées */
  getStockForLot(idLot: number): number {
    const id = Number(idLot);
    const recolte = this.oeufs
      .filter(o => Number(o.id_lot) === id)
      .reduce((s, o) => s + o.nombre, 0);
    const incube = this.incubations
      .filter(i => Number(i.id_lot) === id)
      .reduce((s, i) => s + i.nombre_oeufs, 0);
    const vendu = this.ventes
      .filter(v => Number(v.id_lot) === id)
      .reduce((s, v) => s + v.nombre_oeufs, 0);
    return recolte - incube - vendu;
  }

  /** Stock dispo pour le lot de l'œuf sélectionné en incubation */
  get stockPourIncubation(): number {
    const oeuf = this.oeufs.find(o => Number(o.id_oeuf) === Number(this.newIncubation.id_oeuf));
    if (!oeuf) return 0;
    return this.getStockForLot(oeuf.id_lot);
  }

  /** Stock dispo pour le lot sélectionné en vente */
  get stockPourVente(): number {
    return this.getStockForLot(this.newVente.id_lot);
  }

  get incubationStockInsuffisant(): boolean {
    return this.newIncubation.nombre_oeufs > 0 && this.newIncubation.nombre_oeufs > this.stockPourIncubation;
  }

  get venteStockInsuffisant(): boolean {
    return this.newVente.nombre_oeufs > 0 && this.newVente.nombre_oeufs > this.stockPourVente;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  isEclotBientot(dateEclosion: string): boolean {
    if (!dateEclosion) return false;
    const diff = new Date(dateEclosion).getTime() - Date.now();
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000; // dans les 3 jours
  }

  isEclotRetard(dateEclosion: string): boolean {
    if (!dateEclosion) return false;
    return new Date(dateEclosion).getTime() < Date.now();
  }

  getLotLabel(idLot: number): string {
    const lot = this.lots.find(l => l.id_lot === idLot);
    return lot ? `Lot #${lot.id_lot} (${lot.nom_race || ''})` : `Lot #${idLot}`;
  }
}

export interface Race {
  id_race: number;
  nom_race: string;
  pu_sakafo_g: number;
  pv_g: number;
  pv_g_femelle?: number;
  pv_g_male?: number;
  pv_oeuf: number;
  semaine_debut_ponte: number;
  duree_incubation: number;
  capacite_ponte: number;
}

export interface Lot {
  id_lot: number;
  id_race: number;
  nom_race?: string;
  date_entree: string;
  nombre_initial: number;
  cout_achat: number;
  nb_femelles?: number | null;
  nb_males?: number | null;
}

export interface Croissance {
  id_croissance: number;
  id_race: number;
  semaine: number;
  gain_poids: number;
  nourriture: number;
  nom_race?: string;
}

export interface Mortalite {
  id_mortalite: number;
  id_lot: number;
  date_mort: string;
  nombre: number;
}

export interface Oeuf {
  id_oeuf: number;
  id_lot: number;
  date_recolte: string;
  nombre: number;
  nom_race?: string;
}

export interface Incubation {
  id_incubation: number;
  id_oeuf: number;
  date_debut: string;
  nombre_oeufs: number;
  date_eclosion_prevue: string;
  statut: 'en_cours' | 'eclot' | 'eclot_auto';
  id_lot_resultat: number | null;
  id_lot?: number;
  nom_race?: string;
  duree_incubation?: number;
  oeufs_pourris?: number;
  pourcentage_male?: number;
}

export interface VenteOeuf {
  id_vente: number;
  id_lot: number;
  date_vente: string;
  nombre_oeufs: number;
  prix_unitaire: number;
  revenu_total: number;
  nom_race?: string;
}

export interface PoidsActuelResponse {
  id_lot: number;
  nom_race: string;
  date_entree: string;
  date_situation: string;
  age_semaines: number;
  age_jours: number;
  jours_dans_semaine: number;
  nombre_initial: number;
  nombre_actuel: number;
  mortalites: number;
  cout_achat: number;
  poids_unitaire: number;
  poids_total: number;
  pu_sakafo_g: number;
  pv_g: number;
  pv_g_femelle?: number;
  pv_g_male?: number;
  pv_oeuf: number;
  nourriture_cumulee: number;
  nourriture_totale_g: number;
  cout_nourriture_total: number;
  total_oeufs: number;
  perte_oeufs?: number;
  valeur_perte_oeufs?: number;
  valeur_poulets: number;
  valeur_oeufs: number;
  benefice: number;
  nb_femelles?: number | null;
  nb_males?: number | null;
  nb_femelles_actuelles?: number;
  nb_males_actuels?: number;
  detail_croissance: DetailCroissance[];
}

export interface SituationLotResume {
  id_lot: number;
  nom_race: string;
  date_entree: string;
  nombre_actuel: number;
  mortalites: number;
  total_oeufs: number;
  perte_oeufs?: number;
  valeur_perte_oeufs?: number;
  valeur_poulets: number;
  valeur_oeufs: number;
  cout_nourriture_total: number;
  cout_achat: number;
  benefice: number;
}

export interface SituationGlobale {
  date_situation: string;
  nombre_lots: number;
  lots_en_benefice: number;
  lots_en_perte: number;
  total_poulets_actuel: number;
  total_oeufs: number;
  total_valeur_poulets: number;
  total_valeur_oeufs: number;
  total_cout_nourriture: number;
  total_cout_achat: number;
  total_benefice: number;
  detail_lots: SituationLotResume[];
}

export interface DetailCroissance {
  semaine: number;
  gain_poids: number;
  poids_cumule: number;
  nourriture: number;
  nourriture_cumulee: number;
  nourriture_lot: number;
  cout_nourriture_semaine: number;
  cout_nourriture_cumulee: number;
  est_futur: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

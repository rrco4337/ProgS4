export interface Race {
  id_race: number;
  nom_race: string;
  pu_sakafo_g: number;
  pv_g: number;
  pv_oeuf: number;
  semaine_debut_ponte: number;
  duree_incubation: number;
}

export interface Lot {
  id_lot: number;
  id_race: number;
  nom_race?: string;
  date_entree: string;
  nombre_initial: number;
  cout_achat: number;
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

export interface PoidsActuelResponse {
  id_lot: number;
  nom_race: string;
  date_entree: string;
  age_semaines: number;
  nombre_initial: number;
  nombre_actuel: number;
  mortalites: number;
  poids_unitaire: number;
  poids_total: number;
  nourriture_cumulee: number;
  detail_croissance: DetailCroissance[];
}

export interface DetailCroissance {
  semaine: number;
  gain_poids: number;
  poids_cumule: number;
  nourriture: number;
  nourriture_cumulee: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

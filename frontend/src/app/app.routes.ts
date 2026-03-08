import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LotListComponent } from './components/lot-list/lot-list.component';
import { RaceListComponent } from './components/race-list/race-list.component';
import { CroissanceListComponent } from './components/croissance-list/croissance-list.component';
import { MortaliteListComponent } from './components/mortalite-list/mortalite-list.component';
import { OeufListComponent } from './components/oeuf-list/oeuf-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'lots', component: LotListComponent },
  { path: 'races', component: RaceListComponent },
  { path: 'croissance', component: CroissanceListComponent },
  { path: 'mortalites', component: MortaliteListComponent },
  { path: 'oeufs', component: OeufListComponent },
  { path: '**', redirectTo: '' }
];

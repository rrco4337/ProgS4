import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LotListComponent } from './components/lot-list/lot-list.component';
import { RaceListComponent } from './components/race-list/race-list.component';
import { CroissanceListComponent } from './components/croissance-list/croissance-list.component';
import { MortaliteListComponent } from './components/mortalite-list/mortalite-list.component';
import { OeufListComponent } from './components/oeuf-list/oeuf-list.component';
import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HomeComponent },
      {
        path: 'production',
        children: [
          { path: '', redirectTo: 'lots', pathMatch: 'full' },
          { path: 'lots', component: LotListComponent },
          { path: 'growth', component: CroissanceListComponent }
        ]
      },
      {
        path: 'health',
        children: [
          { path: '', redirectTo: 'mortalities', pathMatch: 'full' },
          { path: 'mortalities', component: MortaliteListComponent }
        ]
      },
      {
        path: 'eggs',
        children: [
          { path: '', redirectTo: 'collection', pathMatch: 'full' },
          { path: 'collection', component: OeufListComponent }
        ]
      },
      {
        path: 'settings',
        children: [
          { path: '', redirectTo: 'races', pathMatch: 'full' },
          { path: 'races', component: RaceListComponent },
          { path: 'growth-models', component: CroissanceListComponent }
        ]
      }
    ]
  },
  { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'lots', redirectTo: 'production/lots', pathMatch: 'full' },
  { path: 'races', redirectTo: 'settings/races', pathMatch: 'full' },
  { path: 'croissance', redirectTo: 'production/growth', pathMatch: 'full' },
  { path: 'mortalites', redirectTo: 'health/mortalities', pathMatch: 'full' },
  { path: 'oeufs', redirectTo: 'eggs/collection', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];

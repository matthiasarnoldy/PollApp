import { Routes } from '@angular/router';
import { Home } from './shared/components/home/home';
import { Header } from './shared/components/header/header';

export const routes: Routes = [
    {path: "", component: Home},
    {path: "home", component: Home},
    {path: "survey/create", component: Header},
];

import { Routes } from '@angular/router';
import { Home } from './shared/components/home/home';
import { Header } from './shared/components/header/header';
import { SurveyView } from './shared/components/survey-view/survey-view';
import { SurveyCreate } from './shared/components/survey-create/survey-create';

export const routes: Routes = [
    {path: "", component: Home},
    {path: "home", component: Home},
    {path: "survey/create", component: SurveyCreate},
    {path: "survey/view", component: SurveyView},
];

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
// import { HeaderComponent } from 'src/app/header/header/header.component';
import { PersonalMapPage } from './personal-map.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalMapPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    PersonalMapPage,
    // HeaderComponent
  ]
})
export class PersonalMapPageModule {}

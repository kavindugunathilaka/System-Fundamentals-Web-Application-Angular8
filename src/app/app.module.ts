import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
// Component
// import { HeaderComponent } from '../app/header/header/header.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireStorageModule } from 'angularfire2/storage';
import { environment } from '../environments/environment';

//pages
import { PersonalMapPageModule } from './pages/personal-map/personal-map.module';

@NgModule({
  declarations: [
    AppComponent,
    // HeaderComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    PersonalMapPageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFirestore,
    AngularFireStorage,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

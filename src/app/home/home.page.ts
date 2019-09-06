import { Component,ViewChild, ElementRef, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  MyLocation
} from '@ionic-native/google-maps/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  map: GoogleMap;

  constructor(private platform: Platform,
    ) {}

  async ngOnInit() {
    await this.platform.ready();
    await this.loadMap();
  }

  loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
      camera: {
        target: {
          lat: 43.0741704,
          lng: -89.3809802
        },
        zoom: 18,
        tilt: 30
      }
    });

  }

  // ionViewDidLoad() {

  //   let mapOptions = {
  //     zoom: 13,
  //     mapTypeId: google.maps.MapTypeId.ROADMAP
  //   };

  //   this.map = new google.maps.Map( this.mapElement.nativeElement, mapOptions );

  //   let latLng = new google.maps.LaLng(43.0741704,-89.3809802);
  //   this.map.setCenter(latLng);
  // }
}

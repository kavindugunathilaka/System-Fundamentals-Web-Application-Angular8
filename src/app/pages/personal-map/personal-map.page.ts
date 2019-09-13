import { Component, OnInit } from '@angular/core';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  MyLocation,
  Environment
} from '@ionic-native/google-maps/ngx';
import { AngularFirestore, AngularFirestoreCollection  } from 'angularfire2/firestore';
import { PopoverController, LoadingController, NavParams } from '@ionic/angular';
import { Params, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-personal-map',
  templateUrl: './personal-map.page.html',
  styleUrls: ['./personal-map.page.scss'],
})
export class PersonalMapPage implements OnInit {

  map: GoogleMap;
  loading: any;
  date: Date = new Date();
  userID: string;
  currentDate: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    // private navParams: NavParams,
    private fireStore: AngularFirestore,
    private popoverCtrl: PopoverController,
    private loadingCtrl: LoadingController
  ) { }

  async ngOnInit() {
    try {
      this.userID = await this.activatedRoute.snapshot.paramMap.get('driverID');
      alert(this.userID);
      this.currentDate = 'Date: ' + this.date.getDate() + '-' + this.date.getMonth() + '-' + this.date.getFullYear();
    } catch (error) {
      alert('Error : ' + error.message );
    }
    
    await this.loadMap();
    
    this.loading = await this.loadingCtrl.create({
      message: 'Loading Personal Map',
      spinner: 'lines'
    });

    // try {
      

    //   // this.userID = this.navParams.get('driverID');
      

    //   // this.userID = this.navParams.get('driverID');
    //   // this.locationId = this.navParams.get('location_id');

    //   // this.userCollection = this.afs.collection(`users/${this.userId}/${currentDate}`);
  
    //   // this.connectionSub = await this.testForData.subscribe((data) => {
    //   //   if ( data ) {
    //   //     this.dataStatusNeg = false;
    //   //     this.imgs = data.imgsrc;
    //   //     this.trash = {
    //   //       lat: data.glongitude,
    //   //       lng: data.glatitude
    //   //     };
    //   //     this.resportStatus = 'data positvie ';
    //   //   } else if (this.resportStatus == null) {
    //   //     this.dataStatusNeg = true;
    //   //     this.resportStatus = 'data neg';
    //   //   }
    //   // });

    // } catch (error) {
    //   alert('Error : ' + error.message );
    // }
  }

  loadMap() {
    this.map = GoogleMaps.create('personalMapCanvas', {
      camera: {
        target: {
          lat: 6.8269531,
          lng: 80.0334884
        },
        zoom: 7,
        tilt: 30
      }
    });
    this.map.setTrafficEnabled(true);
    this.loading.dismiss();
  }

  ionViewDidLeave() {

  }


  closePopOver() {
    this.popoverCtrl.dismiss();
  }
}

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

import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
// import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection  } from 'angularfire2/firestore';
interface Position {
  lat: any;
  lng: any;
  timestamp: any;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  map: GoogleMap;
  driverPositionCollection: AngularFirestoreCollection;
  driverDeviceID: any = '';
  currentPosition: Observable<Position>;
  locationLat: any;
  locationLng: any;
  locationTimeStamp: any;
  driverPosSub: Subscription;
  isTracking = false;
  dumData: any ;
  dumArray = [
    {
      name: 'Diver 1',
      id: '456esfdsdfa'
    },
    {
      name: 'Diver 2',
      id: '456esvfasdva'
    },{
      name: 'Diver 3',
      id: 'sdgdffdsdfa'
    },{
      name: 'Diver 4',
      id: '45546dfa'
    },
  ];
  item: Observable<any>;
  constructor(
    private platform: Platform,
    // private fireAuth: AngularFireAuth,
    private fireStore: AngularFirestore
    ) {}

  async ngOnInit() {
    await this.platform.ready();
    this.driverPositionCollection = this.fireStore
    .collection(
      `driverPostions/CebGDchYMQYtVLzD4ktZfZkJsP83/current`,
      ref => ref.orderBy('timestamp')
    );
    this.item = this.driverPositionCollection.snapshotChanges().pipe(
      map( actions => actions.map( a => {
        const d = a.payload.doc.data();
        const di = a.payload.doc.id;
        return { di, ...d };
      }))
    );
    // await this.item.subscribe( (data) => {
    //   if(data.length <= 0) {
    //     this.dumData = 'no data';
    //   }
    //   else {
    //     for (let m of data){
    //       this.locationLat = m.lat;
    //       this.locationLng = m.lng;
    //       this.locationTimeStamp = m.timestamp;
    //       this.dumArray.push({
    //         lat: m.lat,
    //         lng: m.lng,
    //         timestamp: m.timestamp
    //       });
    //     }
    //     this.dumData = 'there is data';
    //   }
    // });

    await this.loadMap();
  }
  markerArray = [];

  async loadPositions() {
    this.isTracking = true;
    await this.item.subscribe( (data) => {
      let mark: Marker = null;
        this.dumData = data;
        if (this.markerArray.length > 1 ) {
          this.map.clear();
          // mark.remove();
        }
      if(data.length <= 0) {
        this.dumData = 'no data';
      } else {
        for (let m of data){
          this.locationLat = m.lat;
          this.locationLng = m.lng;
          this.locationTimeStamp = m.timestamp;
          // this.dumArray.push({
          //   lat: m.lat,
          //   lng: m.lng,
          //   timestamp: m.timestamp
          // });
        }
        this.dumData = 'there is data';
        mark = this.map.addMarkerSync({
          position : {
          lat: this.locationLat,
          lng: this.locationLng
          },
          icon: {
            url: 'assets/icon/iconfinder-48.png',
            size: {
              width: 32,
              height: 32
            }
          }
        });
        this.markerArray.push(mark);
      }
    });
  }

  loadDriverPostions() {
    this.isTracking = true;
    this.driverPositionCollection = this.fireStore.collection(
      `driverPositions/CebGDchYMQYtVLzD4ktZfZkJsP83/current`
    );
    this.driverPosSub =this.driverPositionCollection.doc<Position>('currentLocate')
    .valueChanges().subscribe( (data) => {
      let mark: Marker = null;
      this.dumData = data;
      if (this.markerArray.length > 1 ) {
        this.map.clear();
        // mark.remove();
      }
      // try {
        
    //   this.locationLat = data.lat;
    //   this.locationLng = data.lng;
    //   this.locationTimeStamp = data.timestamp;
    //   this.markerArray.push(mark);
    //   mark = this.map.addMarkerSync({
    //     position : {
    //     lat: this.locationLat,
    //     lng: this.locationLng
    //   },
    //   icon: {
    //     url: 'assets/icon/iconfinder-48.png',
    //     size: {
    //       width: 32,
    //       height: 32
    //     }
    //   }
    // });
      // } catch (error) {
      // alert("No vehicle is tracked");
      // this.isTracking =false;
      // }
    });
  }
    
  // this.locateCollection = db.collection<Locate>('locates');
  //   this.locates = this.locateCollection.snapshotChanges()
  //   .pipe(map(actions => {
  //     return actions.map(a => {
  //       const gdata = a.payload.doc.data();
  //       const id = a.payload.doc.id;
  //       return { id, ...gdata };
  //     });
  //   }));
  stopTrackingVehicle(){
    this.isTracking = false;
    this.driverPosSub.unsubscribe();
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

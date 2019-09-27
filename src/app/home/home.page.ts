import { Component,ViewChild, ElementRef, OnInit } from '@angular/core';
import { Platform, PopoverController, LoadingController } from '@ionic/angular';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  MyLocation,
  Environment
} from '@ionic-native/google-maps/ngx';

import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
// import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument  } from 'angularfire2/firestore';

import { PersonalMapPage } from '../pages/personal-map/personal-map.page';
import { ThrowStmt } from '@angular/compiler';
import { TouchSequence } from 'selenium-webdriver';
import { database } from 'firebase';

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

  date: Date = new Date();
  map: GoogleMap;
  loading: any;
  driverPositionCollection: AngularFirestoreCollection;
  driversCollection: AngularFirestoreCollection;
  userDriverCollection: AngularFirestoreCollection;
  driverDeviceID: any = '';
  currentPosition: Observable<Position>;
  locationLat: any;
  locationLng: any;
  locationTimeStamp: any;
  driversSubcription: Subscription;
  driverPosSub: Subscription;
  isTracking = false;
  deviceDataArray = [];
  deviceStatusInfo = [];
  driverDataArray = [];
  dumData: any ;
  dumArray = [];
  testArray = [];
  item: Observable<any>;
  deviceDataResult: any = 'no result';
  debugDataResult: any = 'NO RESULTS';
  locationStatus: string = null;
  locationDeviceID: string;
  btnAble = false;
  refDate: string;
  constructor(
    private platform: Platform,
    // private fireAuth: AngularFireAuth,
    private fireStore: AngularFirestore,
    private popoverCtrl: PopoverController,
    private loadingCtrl: LoadingController
    ) {}

  checkUserValid(id: string) {
    // firebase for records
    this.userDriverCollection.doc(id);
  }

  checkDeviceDataArray(id: string) {
    let rslt: Boolean = false;
    for (let dev of this.deviceDataArray){
      if (dev.id === id){
        rslt = true;
      }
    }
    return rslt;
  }

  checkDeviceIndex(id: string) {
    let rslt: number = -1;
    let count = 0;
    for (let dev of this.deviceDataArray){
      if (dev.id === id){
        rslt = count;
      }
      count++;
    }
    return rslt;
  }

  updateDeiveInfoInArray(id: string, obj: any ) {
    let index = this.checkDeviceIndex(id);
    this.deviceDataArray[index] = obj;
  }

  async removeDriver( id: string ) {
    let idx = await this.checkDeviceIndex(id);
    if (idx !== -1 ) {
      await this.deviceDataArray.slice(idx, 1);
      await this.driversCollection.doc(id).delete();
      await this.fireStore.collection(`driverPostions/${id}/current`).doc('currentLocate').delete();
      await window.location.reload();
    } else {
      alert('Item already removed');
    }
  }

  async ngOnInit() {
    this.refDate = 'Date:' + this.date.getDate() + '-' + this.date.getMonth();
    this.loading = await this.loadingCtrl.create({
      message: 'Loading..',
      spinner: 'lines'
    });
    await this.platform.ready();
    // await this.loading.present();
    this.driversCollection = this.fireStore
    .collection('users');
    // this.userDriverCollection = this.fireStore
    // .collection('driverPostions');
    const drivers: Observable<any> = this.driversCollection.snapshotChanges()
    .pipe(
      map( actions => actions.map( a => {
        const deviceData = a.payload.doc.data();
        const deviceID = a.payload.doc.id;
        return { deviceID, ...deviceData };
      }))
    );

    await drivers.subscribe( (data) => {

      if (data.length <= 0 ) {
        this.deviceDataResult = 'Negative';
      } else {
        this.deviceDataResult = 'Positive';
        for ( const device of data ) {
          const deviceExist = this.checkDeviceDataArray(device.deviceID);
          if ( !deviceExist ) {
            this.deviceDataArray.push({
              id: device.deviceID,
              st: device.st,
              status: device.status
            });
          } else {
            const indexOfDevice = this.checkDeviceIndex(device.deviceID);
            if (indexOfDevice >= 0) {
              if ( this.locationDeviceID === device.deviceID) {
                this.locationStatus = device.status;
              }
              this.updateDeiveInfoInArray( device.deviceID,
                {
                  id: device.deviceID,
                  st: device.st,
                  status: device.status
                }
                );
              // alert('device index positive should update');
            } else if ( indexOfDevice === -1 ) {
              alert('No Index found for :' + device.deviceID );
            }
          }

        }
        for (let deviceInfoID of this.deviceDataArray) {
          this.testArray.push(deviceInfoID.id);
        }
      }
    });

  //  normal loading only one device
    this.driverPositionCollection = this.fireStore
    .collection(
        `driverPostions/DLH3xLnaFEb4J5MuONzFD9KCIJY2/current`,
        ref => ref.orderBy('timestamp')
      );
  
    this.item = this.driverPositionCollection.snapshotChanges().pipe(
    map( actions => actions.map( a => {
          const deviceInfoData = a.payload.doc.data();
          const currentID = a.payload.doc.id;
          return { currentID, ...deviceInfoData };
        }))
    );
  
    this.driverPosSub = await this.item.subscribe( (data) => {
        let mark: Marker = null;
        this.dumData = data;
        if (this.markerArray.length > 1 ) {
            this.map.clear();
            // mark.remove();
        }
        if(data.length <= 0) {
          this.dumData = 'Negative Status';
        } else {
          this.dumData = 'Positive Status';
          for (let m of data){
            this.deviceStatusInfo.push({
              driverID: m.driverID,
              status: m.status
            });
            this.locationLat = m.lat;
            this.locationLng = m.lng;
            this.locationTimeStamp = m.timestamp;
            this.locationStatus = m.status;
            this.locationDeviceID = m.driverID;
            // this.dumArray.push({
            //   lat: m.lat,
            //   lng: m.lng,
            //   timestamp: m.timestamp
            // });
          }
          // set mark BEFORE PUSH
          this.markerArray.push(mark);
        }
      }); 

    await this.loadMap();
    await this.loadTrash();
  }

  trashCollection: AngularFirestoreCollection<any>;
  trashObserser: Observable<any>;
  trashLocationSub: Subscription;
  trashMarkerArray = [];
  trashDataInfo: string = null;
  
  async loadTrash() {

    this.trashCollection = await this.fireStore.collection('locates');
    this.trashObserser = await this.trashCollection.snapshotChanges()
    .pipe( map( actions => {
      return actions.map( a => {
        const tdata = a.payload.doc.data();
        const tid = a.payload.doc.id;
        return { tid, ...tdata };
      });
    }));

    this.trashLocationSub = await this.trashObserser.subscribe( (trashData) => {
      // let trashMarker: Marker = null;
      if ( trashData.length <= 0 ) {
        alert('NO Trash Location Retrived');
        this.trashDataInfo = 'Zero trash reported';
      } else {
        this.trashDataInfo = 'Trash reported : ' + trashData.length;
        this.map.clear();
        for ( const trash of trashData ) {
          this.map.addMarkerSync({
            position : {
            lat: trash.glatitude,
            lng: trash.glongitude
            }
          });


        }

      }
    }

    );
  }

  checkTrashIndex(id: string) {
    let rslt: number = -1;
    let count = 0;
    for (let trash of this.trashMarkerArray){
      if (trash.tid === id){
        rslt = count;
      }
      count++;
    }
    return rslt;
  }

  checkTrashMarkerArray(id: string) {
    let rslt: Boolean = false;
    for (let trash of this.trashMarkerArray) {
      if (trash.tid === id) {
        rslt = true;
      }
    }
    return rslt;
  }

  markerArray = [];
  userMark: Marker = null;
  async loadPositionOfDriver(deviceID: string) {
    this.isTracking =true;
    this.locationDeviceID = deviceID;
    this.driverPosSub.unsubscribe();

    this.driverPositionCollection = this.fireStore
    .collection(`driverPostions/${deviceID}/current`);

    this.item = this.driverPositionCollection.snapshotChanges().pipe(
    map( actions => actions.map( a => {
          const deviceInfoData = a.payload.doc.data();
          const currentID = a.payload.doc.id;
          return { currentID, ...deviceInfoData };
        }))
    );
    this.driverPosSub = await this.item.subscribe( (data) => {
      if (this.markerArray.length >= 1 ) {
          const prevMarker: Marker = this.markerArray.pop();
          prevMarker.remove();
      } else {

      }
      for ( let pos of data ){
        this.locationLat = pos.lat;
        this.locationLng = pos.lng;
        this.locationTimeStamp = pos.timestamp;
        this.locationStatus = pos.status;
        this.locationDeviceID = pos.driverID;
      }
      this.userMark = this.map.addMarkerSync({
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
      this.markerArray.push(this.userMark);
    });
  }
  
  driverRecordsSubscription: Subscription;
  isChkDriverRecords: Boolean = false;
  chkingDate: string;
  dRecordID = null;
  dRecordTotalTrash =null;
  recordDate : Date;
  recordsMarkArray = []
  rtestArray = [];
  
  async loadDriversRecords( id: string = 'RTVpQkDfU9gQe6ALPqX15bl7mMs2', date: string = this.refDate  ) {
    // this.trashLocationSub.unsubscribe();
    await this.loadDateOfRecords(id);
    try {
      this.map.clear();
      this.dRecordID = id;
      this.isChkDriverRecords = true;
      // const chkingDate = 'Date:' + this.date.getDate() + this.date.getMonth();
      // test data
      this.chkingDate = date; 
      const userDriverRecords: Observable<any> = await this.fireStore.collection(`users/${id}/${this.chkingDate}`).snapshotChanges()
      .pipe(
        map( actions => actions.map( a => {
          const data = a.payload.doc.data();
          const Dataid = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  
      this.driverRecordsSubscription = await userDriverRecords.subscribe( (cleanedTrash) => {
          this.recordDate = this.date;
          if ( cleanedTrash.length <= 0 ) {
            this.dRecordTotalTrash = "Zero trash cleaned";
            this.rtestArray = [];
          } else {
            this.dRecordTotalTrash = "Total trash cleaned : " + cleanedTrash.length;
            this.rtestArray = cleanedTrash;
            for ( const rec of cleanedTrash ) {
              // this.driverRecordsDatesArr.push(rec.tm)
              const recordLat = rec.lat;
              const recordLng = rec.lng;
              this.map.addMarkerSync({
                position: {
                  lat: recordLat,
                  lng: recordLng
                },
                title: rec.tm,
                icon: 'green'
              });
            }
          }
       });
    } catch (error) {
      alert('Error loading records : ' + error.message);
    }


  }
// testDocCollection: AngularFirestoreDocument ;
testSub: Subscription;
driverRecordsDatesArr = [];
  async loadDateOfRecords( id: string) {
    const Ober: Observable<any>  = this.driversCollection.doc(id).valueChanges();
    this.testSub = await Ober.subscribe( (data) => {
        this.driverRecordsDatesArr = data.dt;
   } );

  }

  async unloadDriversRecords() {
    this.driverRecordsDatesArr = [];
    this.isChkDriverRecords = false;
    await this.driverRecordsSubscription.unsubscribe();
    await this.loadTrash();
  }




  stopTrackingVehicle() {
    this.userMark.remove();
    this.isTracking = false;
    this.driverPosSub.unsubscribe();
  }


  loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
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
  }

}

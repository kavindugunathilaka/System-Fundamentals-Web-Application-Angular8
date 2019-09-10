import { Component,ViewChild, ElementRef, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';

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
import { AngularFirestore, AngularFirestoreCollection  } from 'angularfire2/firestore';
import { debug } from 'util';
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
  constructor(
    private platform: Platform,
    // private fireAuth: AngularFireAuth,
    private fireStore: AngularFirestore
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
    await this.platform.ready();

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
    // Debugg purpose
    // const debugCollection: AngularFirestoreCollection<any> = this.fireStore.collection(
    //   'users'
    // );
    // const debugObse: Observable<any> = debugCollection.snapshotChanges()
    // .pipe(
    //   map( actions => actions.map( a => {
    //     // const debugData = a.payload.doc.data();
    //     const debugID = a.payload.doc.id;
    //     return { debugID };
    //   }))
    // );
    // const debugSub: Subscription = await debugObse.subscribe( (data) => {
    //   if (data.length <= 0 ){
    //     this.debugDataResult = 'Negative';
    //   } else {
    //     this.debugDataResult = 'Positive';
    //     for ( let d of data ){
    //       this.dumArray.push({
    //         id: d.debugID
    //       });
    //     }
    //   }
    // });


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
      let trashMarker: Marker = null;
      if ( trashData <= 0 ) {
        alert('NO Trash Location Retrived');
        this.trashDataInfo = 'Zero trash reported';
      } else {
        this.trashDataInfo = 'Trash reported : ' + trashData.length;
        this.map.clear();
        for ( const trash of trashData ) {

          // trashMarker.setPosition({
          //   lat: trash.glatitude,
          //   lng: trash.glongitude
          // });

          this.map.addMarkerSync({
            position : {
            lat: trash.glatitude,
            lng: trash.glongitude
            },
            // icon: {
            //   url: 'assets/icon/iconfinder-48.png',
            //   size: {
            //     width: 32,
            //     height: 32
            //   }
            // }
          });

          // const trashExist = this.checkTrashMarkerArray( trash.tid );
          // if ( !trashExist ) {
          //   this.trashMarkerArray.push({
          //     id: trash.tid,
          //     lat: trash.glatitude,
          //     lng: trash.glongitude,
          //     timg: trash.imgsrc,
          //     des: trash.description
          //   });
          //   // addMarker and map clear

          // } else {
          //   const indexOfTrash = this.checkTrashIndex( trash.tid );
          //   if ( indexOfTrash >= 0 ) {
          //     // update array
          //   } else if ( indexOfTrash == -1 ) {
          //     // remove marker VOID code IF MAP CLEAR

          //   }

          // }
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
    // alert( 'Driver Id is : ' + deviceID);
    this.driverPosSub.unsubscribe();
    // this.trashLocationSub.unsubscribe();
    // this.map.clear();

    // this.trashLocationSub = await this.trashObserser.subscribe( (trashData) => {
    //   if ( trashData <= 0 ) {
    //     this.trashDataInfo = 'Zero trash reported';
    //   } else {
    //     this.trashDataInfo = 'Trash reported : ' + trashData.length;
    //     this.map.clear();
    //     for ( const trash of trashData ) {
    //       this.map.addMarkerSync({
    //         position : {
    //         lat: trash.glatitude,
    //         lng: trash.glongitude
    //         }
    //       });
    //     }
    //   }
    // });

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
      // this.dumData = data;
      if (this.markerArray.length >= 1 ) {
          // this.map.clear();
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
      // if(data.length <= 0) {
      //   this.dumData = 'Negative Status';
      // } else {
      //   this.dumData = 'Positive Status';
      //   for (let m of data){
      //     this.deviceStatusInfo.push({
      //       driverID: m.driverID,
      //       status: m.status
      //     });
      //     this.locationLat = m.lat;
      //     this.locationLng = m.lng;
      //     this.locationTimeStamp = m.timestamp;
      //     this.locationStatus = m.status;
      //     this.locationDeviceID = m.driverID;

      //   }
      //   mark = this.map.addMarkerSync({
      //     position : {
      //     lat: this.locationLat,
      //     lng: this.locationLng
      //     },
      //     icon: {
      //       url: 'assets/icon/iconfinder-48.png',
      //       size: {
      //         width: 32,
      //         height: 32
      //       }
      //     }
      //   });
        //  ----- Feature if only one driver user is selected 
        // this.map.setCameraTarget(mark.getPosition());
        
        // this.markerArray.push(this.userMark);
    });
  }
  
  async loadPositions() {
    this.isTracking = true;
    this.driverPosSub = await this.item.subscribe( (data) => {
      let mark: Marker = null;
      this.dumData = data;
      if (this.markerArray.length > 1 ) {
        this.map.clear();
      }
      if ( data.length <= 0) {
        this.dumData = 'no data';
      } else {
        for (let m of data){
          this.locationLat = m.lat;
          this.locationLng = m.lng;
          this.locationTimeStamp = m.timestamp;
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

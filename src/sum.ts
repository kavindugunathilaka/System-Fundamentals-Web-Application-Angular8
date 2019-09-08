// async ngOnInit() {
//     await this.platform.ready();

//     this.driversCollection = this.fireStore
//     .collection(
//       'users'
//     );
//     const drivers: Observable<any> = this.driversCollection.snapshotChanges()
//     .pipe(
//       map( actions => actions.map( a => {
//         const deviceData = a.payload.doc.data();
//         const deviceID = a.payload.doc.id;
//         return { deviceID, ...deviceData };
//       }))
//     );

//     await drivers.subscribe( (data) => {
//       // window.location.reload();
//       if (data.length <= 0 ){
//         this.deviceDataResult = 'Negative';
//       } else {
//         this.deviceDataResult = 'Positive';
//         let count = 0;
//         for ( const device of data ) {
//           // count++;
//           // check array for id exist
//           const deviceExist = this.checkDeviceDataArray(device.deviceID);
//           if ( !deviceExist ) {
//             this.deviceDataArray.push({
//               id: device.deviceID,
//               st: device.st,
//               status: device.status
//             });
//           } else {
//             const indexOfDevice = this.checkDeviceIndex(device.deviceID);
//             if (indexOfDevice > 0){
//               this.updateDeiveInfoInArray( device.deviceID,
//                 {
//                   id: device.deviceID,
//                   st: device.st,
//                   status: device.status
//                 }
//                 );
//               // alert('device index positive should update');
//             } else if ( indexOfDevice === -1 ) {
//               alert('No Index found for :' + device.deviceID );
//             }
//           }

//         }
//         for (let deviceInfoID of this.deviceDataArray) {
//           this.testArray.push(deviceInfoID.id);
//         } 
//       }
//     });

//   //  normal loading only one device
//     this.driverPositionCollection = this.fireStore
//     .collection(
//         `driverPostions/DLH3xLnaFEb4J5MuONzFD9KCIJY2/current`,
//         ref => ref.orderBy('timestamp')
//       );
  
//     this.item = this.driverPositionCollection.snapshotChanges().pipe(
//     map( actions => actions.map( a => {
//           const deviceInfoData = a.payload.doc.data();
//           const currentID = a.payload.doc.id;
//           return { currentID, ...deviceInfoData };
//         }))
//     );
  
//     this.driverPosSub = await this.item.subscribe( (data) => {
//         let mark: Marker = null;
//         this.dumData = data;
//         if (this.markerArray.length > 1 ) {
//             this.map.clear();
//             // mark.remove();
//         }
//         if(data.length <= 0) {
//           this.dumData = 'Negative Status';
//         } else {
//           this.dumData = 'Positive Status';
//           for (let m of data){
//             this.deviceStatusInfo.push({
//               driverID: m.driverID,
//               status: m.status
//             });
//             this.locationLat = m.lat;
//             this.locationLng = m.lng;
//             this.locationTimeStamp = m.timestamp;
//             this.locationStatus = m.status;
//             this.locationDeviceID = m.driverID;
//             // this.dumArray.push({
//             //   lat: m.lat,
//             //   lng: m.lng,
//             //   timestamp: m.timestamp
//             // });
//           }
//           // set mark BEFORE PUSH
//           this.markerArray.push(mark);
//         }
//       }); 

//     await this.loadMap();
//   }

//   async loadPositions() {
//     this.isTracking = true;
//     await this.item.subscribe( (data) => {
//       let mark: Marker = null;
//       this.dumData = data;
//       if (this.markerArray.length > 1 ) {
//         this.map.clear();
//           // mark.remove();
//       }
//       if ( data.length <= 0) {
//         this.dumData = 'no data';
//       } else {
//         for (let m of data){
//           this.locationLat = m.lat;
//           this.locationLng = m.lng;
//           this.locationTimeStamp = m.timestamp;
//           // this.dumArray.push({
//           //   lat: m.lat,
//           //   lng: m.lng,
//           //   timestamp: m.timestamp
//           // });
//         }
//         this.dumData = 'there is data';
//         mark = this.map.addMarkerSync({
//           position : {
//           lat: this.locationLat,
//           lng: this.locationLng
//           },
//           icon: {
//             url: 'assets/icon/iconfinder-48.png',
//             size: {
//               width: 32,
//               height: 32
//             }
//           }
//         });
//         this.markerArray.push(mark);
//       }
//     });
//   }
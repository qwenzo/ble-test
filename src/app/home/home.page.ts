import { Component, NgZone } from '@angular/core';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { Platform, ToastController } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  public statusMessage: string;
  public statusMessagePeripheral: string;
  public ServiceMessage: string;
  public respondMessage:string;
  public readBytes = this.bluetoothle.stringToBytes("Read Hello World");

  constructor(public bluetoothle: BluetoothLE, public platform: Platform, private ngZone: NgZone, public toastController: ToastController) {
    this.platform.ready().then((readySource) => {
      this.createToast('Platform ready from'+ readySource, 3000, 'bottom');
      this.bluetoothle.enable();
      const peripheralParams = {
        "request": true,
        "restoreKey" : "bluetoothlepluginPeripheral"
      };
      const serviceParams = {
        service: "6e3d4dfd-1be2-dccc-1213-51a748eee458",
        characteristics: [
          {
            uuid: "7ed07e7a-3d94-2402-693d-803681583b26",
            permissions: {
              read: true,
              write: true,
            },
            properties : {
              read: true,
              writeWithoutResponse: true,
              write: true,
              notify: true,
              indicate: true
            }
          }
        ]
      };
      const advertisementParams = {
        services:["1234"], //iOS
        service:"1234",
        connectable: true,
        timeout: 20000,
        includeDeviceName: true
      };
      this.bluetoothle.initialize().subscribe(ble => {
        console.log('ble', ble.status);
        this.setStatus(ble.status);
      });
      this.bluetoothle.initializePeripheral(peripheralParams).subscribe(
        (stat)=>{
          this.statusMessagePeripheral = this.statusMessagePeripheral+ '---'+ JSON.stringify(stat);
          if(stat.status == "readRequested"){
            this.createToast('read', 3000, 'bottom');
            this.readRequested(stat);
          }
          else if(stat.status == "writeRequested"){
            this.createToast('write', 3000, 'bottom');
            this.writeRequested(stat);
          }
        });
      this.bluetoothle.addService(serviceParams)
      .then((e) => {
        this.ServiceMessage = this.ServiceMessage+ '---'+ JSON.stringify(e);
        if (e.status == "serviceAdded"){
          this.bluetoothle.startAdvertising(advertisementParams)
        }
      })
    });
  }
  readRequested(obj) {
    this.respondMessage = this.respondMessage + '----'+ "Read Requested: " + JSON.stringify(obj);
    //NOTES maximum length was around 6xx, 512 is Bluetooth standards maximum
    
    var slice = this.readBytes.slice(obj.offset);

    var params = {
      requestId: obj.requestId,
      value: this.bluetoothle.bytesToEncodedString(slice),
      address:''
      //code: "invalidHandle", //Adjust error code
    };

    if (obj.address) {
      params.address = obj.address;
    }

    this.respond(params);
  }

  writeRequested(obj) {
    this.respondMessage = this.respondMessage + '----'+ "Write Requested: " + JSON.stringify(obj);
    this.createToast("Write Requested: " + JSON.stringify(obj), 3000, 'top');

    var bytes = this.bluetoothle.encodedStringToBytes(obj.value);
    //TODO send error if necessary
    if (obj.offset > bytes.length) {
      this.respondMessage = this.respondMessage + '----'+ "Oops, an error occurred";
      this.createToast("Oops, an error occurred", 3000, 'middle');
    }
    this.respondMessage = this.respondMessage + '----'+ "Value: " + this.bluetoothle.bytesToString(bytes);
    this.createToast("Value: " + this.bluetoothle.bytesToString(bytes), 3000, 'bottom');
    var params = {
      requestId: obj.requestId,
      value: this.bluetoothle.bytesToEncodedString(bytes),
      address:''
    };
    if (obj.address) {
      params.address = obj.address;
    }
    this.respond(params);
  }

  respond(params) {
    this.respondMessage = this.respondMessage + '----'+ "Respond: " + JSON.stringify(params);
    this.bluetoothle.respond(params).then((obj) => {
      this.respondMessage = this.respondMessage + '----'+ "Respond Success : " + JSON.stringify(obj);
    }, (obj) => {
      this.respondMessage = this.respondMessage + '----'+ "Respond Error : " + JSON.stringify(obj);
    });
  }
  async createToast(message, duration, position){
    let toast = this.toastController.create({
      message: message,
      duration: duration,
      position: position
    });
  
    (await toast).present();
    
    
  }
  setStatus(message: string) {
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }
}
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
  constructor(public bluetoothle: BluetoothLE,
    public platform: Platform,
    private ngZone: NgZone,
    public toastController: ToastController) {  
    this.platform.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      this.setStatus('Platform ready from'+ readySource);
      this.bluetoothle.enable();
      this.bluetoothle.initialize().subscribe(ble => {
        console.log('ble', ble.status);
        this.setStatus(ble.status);
        let peripheralParams = {
          "request": true,
          "restoreKey" : "bluetoothlepluginPeripheral"
        };
        let advertisementParams = {
          "services":["1234"], //iOS
          "service":"1234",
          "name":"munevo test",
          "connectable": true,
          "timeout": 20000,
          "includeDeviceName": true
        };
        this.bluetoothle.initializePeripheral(peripheralParams).subscribe(
          (stat)=>{
            this.setStatus(stat.status+' Peripheral')
            this.bluetoothle.startAdvertising(advertisementParams)
          }
        );
      }, (e)=>{
        this.setStatus(e);
      },
      ()=>{
        this.setStatus('Complete');
      });
    });
  }

  setStatus(message: string) {
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }
}

import { Injectable } from '@angular/core';
import {Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import {Filesystem, Directory, WriteFileResult} from '@capacitor/filesystem';
import {Storage} from '@capacitor/storage';
import { FotoInterface } from '../models/foto.interface';

@Injectable({
  providedIn: 'root'
})
export class FotoService {

  public fotos: FotoInterface[] = [];

  private PHOTO_STORAGE:string = "foto";

  constructor() { }

  public async addNewPhoto() {
    const fotoCapturada = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    this.savePhoto(fotoCapturada);
  }

  public async savePhoto(photo: Photo) {
    const base64Data = this.readAsBase64(photo);
    const fileName = `${new Date().getTime()}.jpeg`;
    base64Data.then((result:any) => {
      this.saveFile( fileName, result, Directory.Data).then((result:WriteFileResult) => {
        this.fotos.unshift({
          webviewPath: photo.webPath,
          filepath: fileName
        });
        Storage.set({
          key: this.PHOTO_STORAGE,
          value: JSON.stringify(this.fotos)
        });
      });
    });
  }

  private async saveFile ( fileName:string, data:string, directoryData:string) {
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: Directory.Data
    });
    return savedFile;
  }

  private async readAsBase64(photo: Photo ) {
    const response = await fetch(photo.webPath!);
    const blobData = await response.blob();
    return new Promise(( resolve, reject) => {
      const f = new FileReader();
      f.onloadend = () => {
        resolve(f.result);
      };
      f.onerror = reject;
      f.readAsDataURL(blobData);
    });
  }

  public async loadImages() {
    const listaFotos = await Storage.get({key: this.PHOTO_STORAGE});
    this.fotos = JSON.parse(listaFotos.value || '') || [];
    for ( let foto of this.fotos ) {
      const readFile = await Filesystem.readFile({
        path: foto.filepath,
        directory: Directory.Data
      });
      foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }
}

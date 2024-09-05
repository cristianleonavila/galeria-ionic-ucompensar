import { Component, OnInit } from '@angular/core';
import { FotoService } from '../services/foto.service';
import { FotoInterface } from '../models/foto.interface';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  constructor(public photoService: FotoService) {}

  async ngOnInit() {
    await this.photoService.loadImages();
  }

  capturarFoto() {
    this.photoService.addNewPhoto();
  }



}

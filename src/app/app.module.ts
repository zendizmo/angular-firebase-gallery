import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule,
        AngularFireStorage,
        AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFireModule } from 'angularfire2';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { NotificationComponent } from './notification/notification.component';
import { GalleryComponent } from './gallery/gallery.component';
import { NotificationServicesService } from './notification-services.service';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    NotificationComponent,
    GalleryComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    // To initialize AngularFire
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [
    NotificationServicesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

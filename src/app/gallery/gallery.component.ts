import { Component, OnInit } from '@angular/core';
import {FormGroup,
        FormsModule,
        ReactiveFormsModule,
        FormBuilder} from '@angular/forms';
import * as $ from 'jquery';
import { NotificationServicesService } from '../notification-services.service';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable, Timestamp } from 'rxjs';
import { finalize, map } from 'rxjs/operators';



export interface Image { id: string; imagePath: string; imageURL: string; imageName: string; maintTs: number; }

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  title = 'app';
  myForm: FormGroup;
  imageNm: string;
  imgPath: string;
  private imagesCollection: AngularFirestoreCollection<Image>;
  images: Observable<Image[]>;
  modalImage: any;
  // main task
  task: AngularFireUploadTask;
  uploadProgress: Observable<number>;
  downloadURL: Observable<string>;

  constructor(private fb: FormBuilder,
              private noteSvc: NotificationServicesService,
              private afStorage: AngularFireStorage,
              private afs: AngularFirestore
  ) {  }

  ngOnInit() {
    this.createForm();
    this.loadImages();
  }
  createForm() {
    this.myForm = this.fb.group({
      imageName: '',
      imageAvatar: null
    });
  }

  onUploadBtnClick() {
    if (this.imageNm === undefined) {
      this.noteSvc.setNotification(
        'Missing Information',
        'Please give a name to the image before you click on upload!'
        );
        $('.notification-btn').click();
    } else {
      $('#imageFile').click();
    }

  }
  onFileChange(event) {
    const reader = new FileReader();
    if (event.target.files &&
      event.target.files.length > 0) {
      const file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        $('#preview')
        .attr('src', URL.createObjectURL(event.target.files[0]));
      };
      this.startUpload(event.target.files);

    }
  }


  startUpload(event: FileList) {
    // File object
    const file = event.item(0);
    console.log(file);

    // client side validation
    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type!');
    }

    // storage path
    this.imgPath = `test/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(this.imgPath);

    // optional metadata
    const customMetadata = { app: 'Angular-FireBase-Gallery'};
    // main task
    this.task = this.afStorage.upload(this.imgPath, file, { customMetadata });

    this.afStorage.upload(this.imgPath, file, { customMetadata });
    // observe percentage changes
    this.uploadProgress = this.task.percentageChanges();
    // get notified when the download URL is available
    this.task.snapshotChanges().pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          // The above step returns an observable which can be subscribed to fetch the data within it
          this.downloadURL.subscribe(data => {
            // to create an id for the document.
            const id = this.afs.createId();
            // storing downloadURL as imageURL
            const imageURL = data;
            // storing image path in firestore
            const imagePath = this.imgPath;
            // Image name fetched from ngModel on 'imageNm' field
            const imageName = this.imageNm;
            // To store timestamp of the image before being inserted in firestore
            const maintTs = Date.now();
            const image: Image = { id, imagePath, imageURL, imageName, maintTs };
            // image object inserted in image collection (AngularFirestoreCollection)
            this.imagesCollection.doc(id).set(image);
            // setting the image name back to blank
            this.imageNm = '';
          });

        })
     )
    .subscribe();

  }

  loadImages() {
    this.imagesCollection = this.afs.collection<Image>('images', ref => ref.orderBy('maintTs', 'desc'));
    this.images = this.imagesCollection.valueChanges();
  }
  maximizeImage(image) {
    this.modalImage = image;
    this.noteSvc.setNotification(
      image.imageName,
      image.imagePath
      );
      $('.max-img-notification-btn').click();
  }
  onDeleteClick(image) {
    this.modalImage = image;
    this.noteSvc.setNotification(
    'Confirmation',
    'Are you sure you want to remove ' + image.imageName
    + ' from the system?'
    );
    $('.del-notification-btn').click();
  }
  deleteItem() {
    console.log('From notifications ' + this.modalImage.id);
    $('.cancel-del-modal').click();
    this.imagesCollection.doc(this.modalImage.id).delete();
    this.afStorage.ref(this.modalImage.imagePath).delete();

  }


}

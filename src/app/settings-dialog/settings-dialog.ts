import { Component } from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-settings-dialog',
  imports: [
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.scss'
})
export class SettingsDialog {
  serverUrlFormControl = new FormControl('', [Validators.required]);

  constructor(public dialogRef: MatDialogRef<SettingsDialog>) {
    const url = localStorage.getItem("url");
    if (url) {
      this.serverUrlFormControl.setValue(url);
    }
  }
  save() {
    if (this.serverUrlFormControl.value) {
      localStorage.setItem("url", this.serverUrlFormControl.value);
      this.dialogRef.close(this.serverUrlFormControl.value);
    }
  }
}

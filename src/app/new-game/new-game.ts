import { Component, inject } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { serverUrlValidator } from './serverUrlValidator';

@Component({
  selector: 'app-new-game',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './new-game.html',
  styleUrl: './new-game.scss',
})
export class NewGame {
  private router = inject(Router);

  serverUrl: string = '';

  newGameForm = new FormGroup({
    name: new FormControl('', Validators.required),
    class: new FormControl('', Validators.required),
    race: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
    serverUrl: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [serverUrlValidator],
      updateOn: 'blur'
    }),
  });

  constructor() {
    const url = localStorage.getItem('url');
    if (url) {
      this.serverUrl = url;
    }
  }
  races: string[] = [
    'Aasimar',
    'Dragonborn',
    'Dwarf',
    'Elf',
    'Gnome',
    'Goliath',
    'Halfling',
    'Human',
    'Orc',
    'Tiefling',
  ];

  classes: string[] = [
    'Barbarian',
    'Bard',
    'Cleric',
    'Druid',
    'Fighter',
    'Monk',
    'Paladin',
    'Ranger',
    'Rogue',
    'Sorcerer',
    'Warlock',
    'Wizard',
  ];

  genders: string[] = ['man', 'woman', 'no gender'];

  async start() {
    if (this.newGameForm.value.serverUrl) {
      localStorage.setItem('url', this.newGameForm.value.serverUrl);
    } else {
      return;
    }

    const prompt = `
    Create a new player named ${this.newGameForm.value.name} who is a ${this.newGameForm.value.gender} ${this.newGameForm.value.race} ${this.newGameForm.value.class}.
    You can then welcome them to the game. 
Describe the surroundings of the player and create an atmosphere that the player can bounce off of. 
Don't make more than 100 words.`;

    try {
      const response = await fetch(`${this.serverUrl}/inquire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        this.router.navigate(['/game', this.newGameForm.value.name]);
      }
    } catch (error) {
      console.error('Request error:', error);
    }
  }

  async checkServerUrl() {
    return true;
    try {
      const response = await fetch(`${this.newGameForm.value.serverUrl}/health`);
      const data = await response.json();
      if (data.status === "healthy") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

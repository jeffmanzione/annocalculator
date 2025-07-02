import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bar',
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './app-bar.html',
  styleUrl: './app-bar.scss',
})
export class AppBar {

  readonly apps = [
    { displayText: 'Production Calculator', path: '/production-calculator' },
    { displayText: 'About', path: '/about' },
  ];

  constructor(readonly router: Router) { }

}

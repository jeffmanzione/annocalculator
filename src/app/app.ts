import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBar } from './shared/components/app-bar/app-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppBar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App { }

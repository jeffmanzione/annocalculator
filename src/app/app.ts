import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppBar } from './components/app-bar/app-bar';

const WWW_PREFIX = 'www.';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  ngOnInit(): void {
    // Strip 'www.' from the URL. This is a personal preference of mine.
    const location = globalThis.location;
    if (location.hostname.startsWith(WWW_PREFIX)) {
      location.hostname = location.hostname.slice(WWW_PREFIX.length);
    }
  }
}

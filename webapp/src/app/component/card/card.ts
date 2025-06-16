import { Component, NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  standalone: false,
})
export class Card { }

@Component({
  selector: 'card-title',
  template: '<ng-content/>',
  standalone: false,
})
export class CardTitle { }

@Component({
  selector: 'card-content',
  template: '<ng-content/>',
  standalone: false,
})
export class CardContent { }

@NgModule({
  imports: [
    MatCardModule,
  ],
  declarations: [
    Card,
    CardTitle,
    CardContent,
  ],
  exports: [
    Card,
    CardTitle,
    CardContent,
  ]
})
export class CardModule { }
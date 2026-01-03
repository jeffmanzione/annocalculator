import { Component, Input, NgModule } from '@angular/core';
import {
  MatCardModule,
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
} from '@angular/material/card';

@Component({
  selector: 'card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent],
})
export class Card {
  @Input()
  presentation: 'default' | 'accent' = 'default';
}

@Component({
  selector: 'card-title',
  template: '<ng-content/>',
  styles: ':host { width: 100%; }',
})
export class CardTitle {}

@Component({
  selector: 'card-content',
  template: '<ng-content/>',
  styles: ':host { width: 100%; }',
})
export class CardContent {}

@NgModule({
  imports: [MatCardModule, Card, CardTitle, CardContent],
  exports: [Card, CardTitle, CardContent],
})
export class CardModule {}

import { Component, computed, inject } from '@angular/core';
import { L10nText } from '../../components/text/text';
import { ThemeService } from '../../services/theme/theme';

@Component({
  selector: 'about-page',
  imports: [L10nText],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutPage {
  private readonly theme_ = inject(ThemeService).themeSignal;

  /** The logo of the game whose theme is in use. */
  readonly logo = computed(() =>
    this.theme_() === 'anno117'
      ? { src: 'anno_117_logo.png', alt: 'Anno 117 Logo' }
      : { src: 'anno_1800_logo.png', alt: 'Anno 1800 Logo' },
  );
}

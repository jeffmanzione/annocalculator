import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { L10nKey } from '../../shared/l10n/l10n';
import { L10nText } from '../text/text';

/** The parts of a calculator page that a phone shows one at a time. */
export type MobileSection = 'plan' | 'summary' | 'trade';

/**
 * The switch between a calculator page's parts on a phone: the islands, the summary of what they make,
 * and the trade routes. It is not shown at any other size, where all three are on the page at once.
 */
@Component({
  selector: 'mobile-section-tabs',
  imports: [L10nText],
  templateUrl: './mobile-section-tabs.html',
  styleUrl: './mobile-section-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSectionTabs {
  readonly section = model<MobileSection>('plan');

  readonly sections: { id: MobileSection; label: L10nKey }[] = [
    { id: 'plan', label: 'Islands' },
    { id: 'summary', label: 'Summary' },
    { id: 'trade', label: 'Trade Routes' },
  ];
}

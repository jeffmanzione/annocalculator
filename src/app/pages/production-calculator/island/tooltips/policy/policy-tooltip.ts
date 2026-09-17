import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnumTooltip } from '../../../../../components/enum-tooltip/enum-tooltip';
import { DepartmentOfLaborPolicy } from '../../../../../shared/game/enums';

import { lookupPolicyIconUrl } from '../../../../../shared/game/icons';
import { lookupPolicyInfo, PolicyInfo } from '../../../../../shared/game/facts';
import { L10nText } from '../../../../../components/text/text';

@Component({
  selector: 'policy-tooltip',
  templateUrl: './policy-tooltip.html',
  styleUrl: './policy-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: EnumTooltip, useExisting: PolicyTooltip }],
  imports: [L10nText],
})
export class PolicyTooltip extends EnumTooltip<DepartmentOfLaborPolicy> {
  policyInfo: PolicyInfo | null = null;

  protected override onValueChange(value: DepartmentOfLaborPolicy): void {
    this.policyInfo = lookupPolicyInfo(value)!;
  }

  policyIconUrlLookupFn(
    policy: DepartmentOfLaborPolicy | null | undefined,
  ): string {
    return (
      lookupPolicyIconUrl(policy ?? DepartmentOfLaborPolicy.None) ||
      DepartmentOfLaborPolicy.None
    );
  }

  get extraGoodText(): string {
    return `${this.policyInfo?.extraGood?.rateNumerator} / ${this.policyInfo?.extraGood?.rateDenominator}`;
  }

  get productivityText(): string {
    return `+${(this.policyInfo!.productivityEffect ?? 0) * 100}%`;
  }
}

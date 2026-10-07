import {
  Component,
  provideZonelessChangeDetection,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { EnumSelect } from './enum-select';

@Component({
  imports: [EnumSelect, ReactiveFormsModule],
  template: `
    <enum-select
      [formControl]="control"
      [options]="options"
      [multiple]="multiple"
      [multipleSelectLimit]="limit"
      [valueIsExemptFromLimit]="isExempt"
      [wrapInMatFormField]="false"></enum-select>
  `,
})
class Host {
  readonly select = viewChild.required(EnumSelect<string>);
  control = new FormControl<string | string[] | null>(null);
  options = ['Apple', 'Banana', 'Cherry'];
  multiple = false;
  limit = Number.MAX_SAFE_INTEGER;
  isExempt = (v: string) => v === 'Cherry';
}

describe('EnumSelect', () => {
  const setup = async (configure: (host: Host) => void = () => {}) => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(Host);
    configure(fixture.componentInstance);
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const select = await loader.getHarness(MatSelectHarness);
    return { fixture, host: fixture.componentInstance, select };
  };

  it('lists its options', async () => {
    const { select } = await setup();
    await select.open();
    expect((await select.getOptions()).length).toBe(3);
    expect(
      await Promise.all((await select.getOptions()).map((o) => o.getText())),
    ).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it('shows the form control value', async () => {
    const { host, fixture, select } = await setup();
    host.control.setValue('Banana');
    await fixture.whenStable();
    expect(await select.getValueText()).toBe('Banana');
  });

  it('writes the chosen option back to the form control', async () => {
    const { host, select } = await setup();
    await select.open();
    await (await select.getOptions({ text: 'Cherry' }))[0].click();
    expect(host.control.value).toBe('Cherry');
  });

  it('shows a localized "None" placeholder when empty', async () => {
    const { select } = await setup();
    expect(await select.getValueText()).toBe('None');
  });

  it('disables the form control', async () => {
    const { host, fixture, select } = await setup();
    host.control.disable();
    await fixture.whenStable();
    expect(await select.isDisabled()).toBe(true);
  });

  it('supports several selections', async () => {
    const { host, select } = await setup((h) => (h.multiple = true));
    await select.open();
    await (await select.getOptions({ text: 'Apple' }))[0].click();
    await (await select.getOptions({ text: 'Banana' }))[0].click();
    expect(host.control.value).toEqual(['Apple', 'Banana']);
  });

  it('stops offering more options at the limit, except exempt ones', async () => {
    const { select } = await setup((h) => {
      h.multiple = true;
      h.limit = 1;
      h.control.setValue(['Apple']);
    });
    await select.open();
    const disabled = await Promise.all(
      (await select.getOptions()).map(async (o) => [
        await o.getText(),
        await o.isDisabled(),
      ]),
    );
    expect(disabled).toEqual([
      ['Apple', false],
      ['Banana', true],
      ['Cherry', false],
    ]);
  });

  it('hides open tooltips on every row when the panel closes', async () => {
    const { host, select } = await setup();
    await select.open();
    const rows = (
      host.select() as unknown as {
        rows_: () => { hideAllTooltips: () => void }[];
      }
    ).rows_();
    expect(rows.length).toBeGreaterThan(0);
    const hide = rows.map((row) => vi.spyOn(row, 'hideAllTooltips'));
    await select.close();
    for (const spy of hide) expect(spy).toHaveBeenCalled();
  });

  it('does not hide tooltips when the panel opens', async () => {
    const { host, select } = await setup();
    const spy = vi.spyOn(
      host.select() as unknown as { onOpenedChange(opened: boolean): void },
      'onOpenedChange',
    );
    await select.open();
    expect(spy).toHaveBeenCalledWith(true);
    const rows = (
      host.select() as unknown as {
        rows_: () => { hideAllTooltips: () => void }[];
      }
    ).rows_();
    const hide = rows.map((row) => vi.spyOn(row, 'hideAllTooltips'));
    for (const h of hide) expect(h).not.toHaveBeenCalled();
  });
});

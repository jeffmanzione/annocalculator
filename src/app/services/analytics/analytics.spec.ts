import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Analytics, GOATCOUNTER_CODE, shouldTrack, TrackerEnvironment } from './analytics';

const env = (
  hostname: string,
  navigator: TrackerEnvironment['navigator'] = {},
  document: Document = globalThis.document,
): TrackerEnvironment => ({ location: { hostname }, navigator, document });

describe('shouldTrack', () => {
  it('tracks only the live site', () => {
    expect(shouldTrack(env('annocalculator.com'))).toBe(true);
    expect(shouldTrack(env('www.annocalculator.com'))).toBe(true);
    expect(shouldTrack(env('localhost'))).toBe(false);
    expect(shouldTrack(env('127.0.0.1'))).toBe(false);
    expect(shouldTrack(env('annocalculator.com.example.org'))).toBe(false);
  });

  it('respects Do Not Track and Global Privacy Control', () => {
    expect(shouldTrack(env('annocalculator.com', { doNotTrack: '1' }))).toBe(false);
    expect(shouldTrack(env('annocalculator.com', { doNotTrack: 'yes' }))).toBe(false);
    expect(shouldTrack(env('annocalculator.com', { doNotTrack: '0' }))).toBe(true);
    expect(shouldTrack(env('annocalculator.com', { globalPrivacyControl: true }))).toBe(false);
  });
});

describe('Analytics', () => {
  let events: Subject<unknown>;
  let analytics: Analytics;

  beforeEach(() => {
    events = new Subject();
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: { events } }] });
    analytics = TestBed.inject(Analytics);
  });

  const fakeDocument = () => {
    const script: { onload?: () => void; src?: string; async?: boolean } = {};
    const doc = {
      createElement: () => script,
      head: { appendChild: vi.fn() },
    } as unknown as Document;
    return { doc, script };
  };

  it('does nothing off the live site', () => {
    const { doc } = fakeDocument();
    analytics.start(env('localhost', {}, doc));
    expect(doc.head.appendChild).not.toHaveBeenCalled();
  });

  it('loads the counter and reports each page after it loads', () => {
    const { doc, script } = fakeDocument();
    const e = env('annocalculator.com', {}, doc);
    analytics.start(e);
    expect(script.src).toContain('count.js');
    expect(e.goatcounter?.no_onload).toBe(true);
    expect(e.goatcounter?.endpoint).toBe(`https://${GOATCOUNTER_CODE}.goatcounter.com/count`);

    // The first page is reported once the script has loaded; the counter then adds count().
    events.next(new NavigationEnd(1, '/', '/calculator'));
    const count = vi.fn();
    e.goatcounter!.count = count;
    script.onload!();
    expect(count).toHaveBeenCalledWith({ path: '/calculator' });

    events.next(new NavigationEnd(2, '/about', '/about'));
    expect(count).toHaveBeenLastCalledWith({ path: '/about' });
    expect(count).toHaveBeenCalledTimes(2);
  });
});

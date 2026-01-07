import {
  AfterContentInit,
  ApplicationRef,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  HostListener,
  Injector,
  OnDestroy,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'tooltip-content',
  template: '',
  styles: '',
})
export abstract class TooltipContentComponent {}

@Directive({
  selector: '[tooltip]',
})
export class TooltipDirective implements OnDestroy {
  @ContentChild('tooltipContent')
  tooltipContent!: ElementRef;

  constructor(private readonly appRef: ApplicationRef) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.appRef.attachView(this.tooltipContent.nativeElement);
    document.body.appendChild(this.tooltipContent.nativeElement);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.destroy();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(): void {
    this.appRef.detachView(this.tooltipContent.nativeElement);
  }
}

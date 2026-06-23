import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductRowMenuComponent } from './product-row-menu.component';

describe('ProductRowMenuComponent', () => {
  let fixture: ComponentFixture<ProductRowMenuComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductRowMenuComponent);
    fixture.detectChanges();
  });

  function trigger(): HTMLElement {
    return fixture.nativeElement.querySelector('.row-menu__trigger');
  }
  function dropdown(): HTMLElement | null {
    return fixture.nativeElement.querySelector('.row-menu__dropdown');
  }

  it('abre el menú con el botón', () => {
    expect(dropdown()).toBeNull();
    trigger().click();
    fixture.detectChanges();
    expect(dropdown()).toBeTruthy();
  });

  it('se cierra al volver a pulsar el botón', () => {
    trigger().click();
    fixture.detectChanges();
    expect(dropdown()).toBeTruthy();

    trigger().click();
    fixture.detectChanges();
    expect(dropdown()).toBeNull();
  });

  it('se cierra al hacer scroll', () => {
    trigger().click();
    fixture.detectChanges();
    expect(dropdown()).toBeTruthy();

    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(dropdown()).toBeNull();
  });

  it('emite "edit" y cierra al pulsar Editar', () => {
    let edited = 0;
    fixture.componentInstance.edit.subscribe(() => (edited += 1));

    trigger().click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.row-menu__item').click();
    fixture.detectChanges();

    expect(edited).toBe(1);
    expect(dropdown()).toBeNull();
  });

  it('se cierra al hacer click fuera', () => {
    trigger().click();
    fixture.detectChanges();
    expect(dropdown()).toBeTruthy();

    document.body.click();
    fixture.detectChanges();
    expect(dropdown()).toBeNull();
  });
});

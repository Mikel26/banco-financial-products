import { TestBed } from '@angular/core/testing';

import { ProductTableSkeletonComponent } from './product-table-skeleton.component';

describe('ProductTableSkeletonComponent', () => {
  it('crea el componente', () => {
    const fixture = TestBed.createComponent(ProductTableSkeletonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza tantas filas como indique `rows`', () => {
    const fixture = TestBed.createComponent(ProductTableSkeletonComponent);
    fixture.componentRef.setInput('rows', 3);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(3);
  });

  it('expone aria-busy para lectores de pantalla', () => {
    const fixture = TestBed.createComponent(ProductTableSkeletonComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table').getAttribute('aria-busy')).toBe('true');
  });
});

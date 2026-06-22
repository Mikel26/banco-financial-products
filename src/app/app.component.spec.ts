import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('debería crear el componente raíz', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería renderizar la cabecera del banco', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-header');
    expect(header?.textContent).toContain('Banco');
  });
});

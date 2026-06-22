import { TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('renderiza el título por defecto "Banco"', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Banco');
  });

  it('muestra el subtítulo cuando se provee', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('subtitle', 'Productos financieros');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Productos financieros');
  });
});

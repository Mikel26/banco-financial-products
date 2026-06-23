import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
} from '@angular/core';

interface MenuPosition {
  readonly top: number;
  readonly right: number;
}

/**
 * Menú contextual (kebab) por fila del listado, según diseño D3. Abre un
 * dropdown con la acción "Editar"; se cierra al elegir, al hacer click fuera o
 * al hacer scroll. El dropdown se posiciona como overlay `fixed` (coordenadas
 * calculadas bajo el botón) para que **no lo recorten** el `overflow` de la
 * tabla ni el del contenedor con scroll. ("Eliminar" es F6, fuera de scope.)
 */
@Component({
  selector: 'app-product-row-menu',
  standalone: true,
  templateUrl: './product-row-menu.component.html',
  styleUrl: './product-row-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductRowMenuComponent {
  readonly edit = output<void>();
  readonly open = signal(false);
  readonly position = signal<MenuPosition | null>(null);

  private readonly host = inject(ElementRef<HTMLElement>);

  toggle(event: MouseEvent): void {
    if (this.open()) {
      this.open.set(false);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.position.set({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    this.open.set(true);
  }

  onEdit(): void {
    this.open.set(false);
    this.edit.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }
}

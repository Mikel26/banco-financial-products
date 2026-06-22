import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonType = 'button' | 'submit' | 'reset';

/** Botón reutilizable del design system. Proyecta su contenido vía `ng-content`. */
@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly clicked = output<void>();

  readonly classes = computed(() => {
    const list = ['btn', `btn--${this.variant()}`];
    if (this.fullWidth()) {
      list.push('btn--full');
    }
    return list.join(' ');
  });

  onClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}

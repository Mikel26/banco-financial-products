import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Cabecera de la aplicación con la marca del Banco. */
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly title = input<string>('Banco');
  readonly subtitle = input<string>('');
}

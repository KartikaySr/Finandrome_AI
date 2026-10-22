// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, computed, input, signal } from '@angular/core';
@Component({
  selector: 'los-chart',
  template: `<div class="chart-frame">
    <svg viewBox="0 0 720 220" role="img" [attr.aria-label]="label()">
      <title>{{ label() }}</title>
      @for (y of [20, 70, 120, 170, 210]; track y) {
        <line x1="0" [attr.y1]="y" x2="720" [attr.y2]="y" stroke="currentColor" opacity=".08" />
      }
      <path [attr.d]="area()" fill="currentColor" opacity=".07" />
      <path
        [attr.d]="path()"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      @for (value of values(); track $index) {
        <g>
          <circle
            [attr.cx]="x($index)"
            [attr.cy]="y(value)"
            r="5"
            fill="currentColor"
            [attr.opacity]="active() === $index ? 1 : 0.1"
          />
          <circle
            [attr.cx]="x($index)"
            [attr.cy]="y(value)"
            r="15"
            fill="transparent"
            tabindex="0"
            role="button"
            [attr.aria-label]="labels()[$index] + ': ' + value + ' ' + unit()"
            (mouseenter)="active.set($index)"
            (focus)="active.set($index)"
            (click)="active.set($index)"
            (keydown.enter)="active.set($index)"
          />
        </g>
      }
    </svg>
    <div class="chart-labels">
      @for (label of labels(); track $index) {
        <span [class.highlight]="active() === $index">{{ label }}</span>
      }
    </div>
    <p class="chart-caption">
      {{ labels()[active()] }} · {{ values()[active()] }} {{ unit() }}
      <span> / {{ caption() }}</span>
    </p>
  </div>`,
  styles: [
    ':host{display:block;color:var(--accent)}svg{width:100%;height:auto;overflow:visible}.chart-labels{display:flex;justify-content:space-between;color:var(--muted);font-size:11px;margin-top:14px}.highlight{color:var(--accent)}.chart-caption{font-size:12px;margin:18px 0 0;color:var(--text)}.chart-caption span{color:var(--muted)}circle[role=button]{cursor:pointer;outline:none}circle[role=button]:focus-visible{stroke:var(--accent);stroke-width:2}',
  ],
})
export class ChartComponent {
  readonly values = input<number[]>([15, 25, 20, 39, 34, 48, 44, 62, 58, 76, 73, 89]);
  readonly labels = input<string[]>([
    '01',
    '03',
    '05',
    '07',
    '09',
    '11',
    '13',
    '15',
    '17',
    '19',
    '21',
    '22',
  ]);
  readonly label = input('Synthetic lending activity over time');
  readonly caption = input('Illustrative monthly fixture, not live financial performance');
  readonly unit = input('applications');
  readonly active = signal(0);
  readonly max = computed(() => Math.max(...this.values(), 1) * 1.12);
  x(index: number): number {
    return 6 + (index * 708) / Math.max(this.values().length - 1, 1);
  }
  y(value: number): number {
    return 210 - (value / this.max()) * 190;
  }
  readonly path = computed(() =>
    this.values()
      .map((value, i) => `${i ? 'L' : 'M'} ${this.x(i)} ${this.y(value)}`)
      .join(' '),
  );
  readonly area = computed(() => `${this.path()} L 714 210 L 6 210 Z`);
}

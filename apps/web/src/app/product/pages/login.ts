// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DemoStore } from '../data/demo-store';
import { Role, ROLES } from '../data/models';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-demo-login',
  imports: [RouterLink, IconComponent],
  template: ` <div class="login-page">
    <a class="wordmark login-brand" routerLink="/"
      ><span class="brand-mark">f<span>.</span></span
      >finandrome<span class="brand-ai">AI</span></a
    >
    <main id="main-content" class="login-card">
      <p class="eyebrow">A DIFFERENT PERSPECTIVE</p>
      <h1>Your workspace.<br /><em>Your point of view.</em></h1>
      <p>Choose a persona to explore the lending experience.</p>
      <div class="role-grid">
        @for (role of roles; track role) {
          <button
            type="button"
            [class.selected]="selected() === role"
            (click)="selected.set(role)"
            [attr.aria-pressed]="selected() === role"
          >
            <los-icon
              [name]="role === 'Customer' ? 'wallet' : role === 'Auditor' ? 'shield' : 'users'"
            /><span>{{ role }}</span>
            @if (selected() === role) {
              <los-icon name="check" />
            }
          </button>
        }
      </div>
      <button type="button" class="button primary full" (click)="enter()">
        Explore as {{ selected() }} <los-icon name="right" />
      </button>
      <div class="demo-explainer">
        <los-icon name="eye" /><span
          ><strong>Frontend preview, not a real account.</strong> Uses fictional data stored in this
          browser. No password, banking connection or live AI. Switching personas is a UX
          simulation, not a security boundary.</span
        >
      </div>
    </main>
    <p class="login-bottom">
      Built on open foundations. <a routerLink="/open-source">Explore the acknowledgements ↗</a>
    </p>
  </div>`,
})
export class LoginComponent {
  readonly store = inject(DemoStore);
  readonly router = inject(Router);
  readonly roles = ROLES;
  readonly selected = signal<Role>('Branch manager');
  enter(): void {
    this.store.enter(this.selected());
    void this.router.navigate(['/workspace/overview']);
  }
}

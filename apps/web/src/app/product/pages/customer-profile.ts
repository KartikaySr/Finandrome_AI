// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../data/demo-store';
@Component({
  selector: 'los-customer-profile',
  imports: [FormsModule, RouterLink],
  template: ` <div class="page-heading">
      <div>
        <p class="eyebrow">CUSTOMER PROFILE</p>
        <h1>A clear starting point.</h1>
        <p>Save fictional applicant details to prefill your next application.</p>
      </div>
      <a routerLink="/workspace/products" class="button outline">Explore products</a>
    </div>
    <form class="panel" (ngSubmit)="save()">
      <div class="form-grid">
        <label class="field"
          >Applicant name<input name="name" [(ngModel)]="profile.name" maxlength="80" required
        /></label>
        <label class="field"
          >Applicant email<input name="email" [(ngModel)]="profile.email" type="email" required
        /></label>
        <label class="field"
          >Phone<input name="phone" [(ngModel)]="profile.phone" maxlength="20" required
        /></label>
        <label class="field"
          >City<input name="city" [(ngModel)]="profile.city" maxlength="80" required
        /></label>
        <label class="field full-span"
          >Employment / business description<input
            name="employment"
            [(ngModel)]="profile.employment"
            maxlength="100"
            required
        /></label>
      </div>
      <p class="notice">
        Fictional information only. This profile stays in this browser and does not create an
        authenticated account.
      </p>
      @if (error()) {
        <p role="alert" class="form-error">{{ error() }}</p>
      }
      <button class="button primary" type="submit">Save customer profile</button>
    </form>`,
})
export class CustomerProfileComponent {
  readonly store = inject(DemoStore);
  readonly error = signal('');
  profile = {
    ...(this.store.state().customerProfile ?? {
      name: '',
      email: '',
      phone: '',
      city: '',
      employment: '',
    }),
  };
  save() {
    try {
      this.store.saveCustomerProfile(this.profile);
      this.error.set('');
    } catch (e) {
      this.error.set((e as Error).message);
    }
  }
}

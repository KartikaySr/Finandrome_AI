// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DemoStore } from '../data/demo-store';
import { PRODUCTS, STATUSES, money } from '../data/models';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-applications',
  imports: [FormsModule, RouterLink, DatePipe, IconComponent],
  templateUrl: './applications.html',
})
export class ApplicationsComponent {
  readonly store = inject(DemoStore);
  readonly route = inject(ActivatedRoute);
  readonly money = money;
  readonly mode = this.route.snapshot.data['mode'] ?? 'applications';
  readonly products = PRODUCTS;
  readonly statuses = STATUSES;
  readonly query = signal('');
  readonly status = signal('All statuses');
  readonly product = signal('All products');
  readonly page = signal(1);
  readonly sort = signal('newest');
  readonly title =
    this.mode === 'review'
      ? 'The review desk.'
      : this.mode === 'approvals'
        ? 'Decisions that move forward.'
        : 'Every application. In view.';
  readonly filtered = computed(() => {
    let rows = this.store.applications();
    if (this.mode === 'review')
      rows = rows.filter((app) => ['Submitted', 'Under review', 'Referred'].includes(app.status));
    if (this.mode === 'approvals')
      rows = rows.filter((app) => ['Under review', 'Approved'].includes(app.status));
    return rows
      .filter(
        (app) =>
          (this.status() === 'All statuses' || app.status === this.status()) &&
          (this.product() === 'All products' || app.product === this.product()) &&
          `${app.id} ${app.name} ${app.business}`
            .toLowerCase()
            .includes(this.query().toLowerCase()),
      )
      .sort((a, b) =>
        this.sort() === 'amount' ? b.amount - a.amount : b.created.localeCompare(a.created),
      );
  });
  readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 8)));
  readonly current = computed(() => Math.min(this.page(), this.pages()));
  readonly rows = computed(() =>
    this.filtered().slice((this.current() - 1) * 8, this.current() * 8),
  );
  readonly total = computed(() => this.filtered().reduce((sum, app) => sum + app.amount, 0));
  updateQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
  }
  export(): void {
    this.store.downloadCsv(
      'finandrome-applications-demo.csv',
      ['Reference', 'Applicant', 'Product', 'Requested INR', 'Status', 'Office'],
      this.filtered().map((app) => [
        app.id,
        app.name,
        app.product,
        app.amount,
        app.status,
        app.office,
      ]),
    );
  }
}

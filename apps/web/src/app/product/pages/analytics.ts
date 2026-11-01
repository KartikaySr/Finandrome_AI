// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { scheduleFor } from '../data/servicing';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DemoStore } from '../data/demo-store';
import { OFFICES, PRODUCTS, compactMoney, money } from '../data/models';
import { IconComponent } from '../ui/icon';
import { tabKey } from '../ui/tab-keyboard';
import { ChartComponent } from '../ui/chart';
@Component({
  selector: 'los-analytics',
  imports: [FormsModule, DecimalPipe, IconComponent, ChartComponent],
  templateUrl: './analytics.html',
})
export class AnalyticsComponent {
  readonly store = inject(DemoStore);
  readonly tabs = ['Portfolio health', 'Delinquency & PAR', 'Repayment behavior', 'Origination'];
  readonly tab = signal('Portfolio health');
  readonly office = signal('All permitted offices');
  readonly product = signal('All products');
  readonly products = PRODUCTS;
  readonly offices = OFFICES;
  readonly money = money;
  readonly compactMoney = compactMoney;
  readonly loans = computed(() =>
    this.store
      .loans()
      .filter(
        (loan) =>
          (this.office() === 'All permitted offices' || loan.office === this.office()) &&
          (this.product() === 'All products' || loan.product === this.product()),
      ),
  );
  readonly applications = computed(() =>
    this.store
      .applications()
      .filter(
        (app) =>
          (this.office() === 'All permitted offices' || app.office === this.office()) &&
          (this.product() === 'All products' || app.product === this.product()),
      ),
  );
  readonly total = computed(() => this.loans().reduce((sum, loan) => sum + loan.outstanding, 0));
  readonly disbursed = computed(() => this.loans().reduce((sum, loan) => sum + loan.principal, 0));
  readonly collected = computed(() =>
    this.loans().reduce(
      (sum, loan) =>
        sum +
        scheduleFor(loan)
          .filter((row) => row.number <= loan.paid)
          .reduce((total, row) => total + row.total, 0),
      0,
    ),
  );
  readonly overdueCount = computed(() => this.loans().filter((loan) => loan.overdue > 0).length);
  readonly rejected = computed(
    () => this.applications().filter((app) => app.status === 'Rejected').length,
  );
  readonly submitted = computed(
    () => this.applications().filter((app) => app.status !== 'Draft').length,
  );
  readonly approved = computed(
    () =>
      this.applications().filter((app) => ['Approved', 'Disbursed'].includes(app.status)).length,
  );
  readonly mix = computed(() =>
    this.products.map((product) => ({
      name: product,
      value: this.loans()
        .filter((loan) => loan.product === product)
        .reduce((sum, loan) => sum + loan.outstanding, 0),
    })),
  );
  readonly buckets = computed(() =>
    [
      { name: 'Current / 0 days', min: 0, max: 0 },
      { name: 'Watch / 1–30 days', min: 1, max: 30 },
      { name: '31–60 days', min: 31, max: 60 },
      { name: '61–90 days', min: 61, max: 90 },
      { name: '91+ days', min: 91, max: Number.POSITIVE_INFINITY },
    ]
      .map((bucket) => ({
        ...bucket,
        loans: this.loans().filter(
          (loan) => loan.overdue >= bucket.min && loan.overdue <= bucket.max,
        ),
      }))
      .map((bucket) => ({
        ...bucket,
        value: bucket.loans.reduce((sum, loan) => sum + loan.outstanding, 0),
      })),
  );
  readonly funnel = computed(() =>
    ['Submitted', 'Under review', 'Referred', 'Approved', 'Rejected', 'Disbursed'].map(
      (status) => ({
        status,
        count: this.applications().filter((app) => app.status === status).length,
      }),
    ),
  );
  par(days: number): number {
    return this.total()
      ? (this.loans()
          .filter((loan) => loan.overdue > days)
          .reduce((sum, loan) => sum + loan.outstanding, 0) /
          this.total()) *
          100
      : 0;
  }
  percent(value: number): number {
    return this.total() ? (value / this.total()) * 100 : 0;
  }
  export(): void {
    this.store.downloadCsv(
      'finandrome-analytics-demo.csv',
      ['Metric', 'Value', 'Units', 'Source'],
      [
        ['Applications', this.applications().length, 'applications', 'Synthetic fixture'],
        ['Original disbursed principal', this.disbursed(), 'INR', 'Synthetic fixture'],
        ['Illustrative collected', this.collected(), 'INR', 'Schedule-derived synthetic receipts'],
        ['Overdue accounts', this.overdueCount(), 'accounts', 'Synthetic fixture'],
        ['Outstanding principal', this.total(), 'INR', 'Synthetic fixture'],
        ['Active loans', this.loans().length, 'accounts', 'Synthetic fixture'],
        ['PAR30', this.par(30).toFixed(2), '%', 'Synthetic fixture'],
        ['PAR60', this.par(60).toFixed(2), '%', 'Synthetic fixture'],
        ['PAR90', this.par(90).toFixed(2), '%', 'Synthetic fixture'],
        ['Submitted applications', this.submitted(), 'applications', 'Synthetic fixture'],
      ],
    );
  }
  onTabKey(event: KeyboardEvent, index: number): void {
    const selected = tabKey(event, this.tabs, index);
    if (selected) this.tab.set(selected);
  }
}

// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
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
      { name: 'Watch / 1–29 days', min: 1, max: 29 },
      { name: '30–59 days', min: 30, max: 59 },
      { name: '60–89 days', min: 60, max: 89 },
      { name: '90+ days', min: 90, max: 9999 },
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
          .filter((loan) => loan.overdue >= days)
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

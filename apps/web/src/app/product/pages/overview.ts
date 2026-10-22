// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../data/demo-store';
import { compactMoney, money } from '../data/models';
import { ChartComponent } from '../ui/chart';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-overview',
  imports: [RouterLink, DatePipe, DecimalPipe, ChartComponent, IconComponent],
  templateUrl: './overview.html',
})
export class OverviewComponent {
  readonly store = inject(DemoStore);
  readonly compactMoney = compactMoney;
  readonly money = money;
  readonly approved = computed(
    () =>
      this.store.applications().filter((app) => ['Approved', 'Disbursed'].includes(app.status))
        .length,
  );
  readonly verified = computed(
    () => this.store.documents().filter((doc) => doc.status === 'Verified').length,
  );
  export(): void {
    this.store.downloadCsv(
      'finandrome-portfolio-demo.csv',
      ['Loan', 'Borrower', 'Principal INR', 'Outstanding INR', 'Overdue days'],
      this.store
        .loans()
        .map((loan) => [loan.id, loan.name, loan.principal, loan.outstanding, loan.overdue]),
    );
  }
}

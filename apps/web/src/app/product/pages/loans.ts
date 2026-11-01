// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DemoStore } from '../data/demo-store';
import { compactMoney, money } from '../data/models';
import { scheduleFor } from '../data/servicing';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-loans',
  imports: [RouterLink, FormsModule, DatePipe, IconComponent],
  templateUrl: './loans.html',
})
export class LoansComponent {
  readonly store = inject(DemoStore);
  readonly route = inject(ActivatedRoute);
  readonly money = money;
  readonly compactMoney = compactMoney;
  readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly id = computed(() => this.params().get('id'));
  readonly loan = computed(() => this.store.findLoan(this.id() ?? ''));
  readonly detailTab = signal('Schedule');
  readonly historyRange = signal('All receipts');
  readonly transactions = computed(() => {
    const rows = this.schedule().filter((row) => row.status === 'Illustrative paid');
    return this.historyRange() === 'Latest 3' ? rows.slice(-3) : rows;
  });
  readonly product = signal('All products');
  readonly products = ['Business growth', 'Personal credit', 'Education', 'Equipment finance'];
  clearFilters() {
    this.query.set('');
    this.status.set('All accounts');
    this.product.set('All products');
  }
  exportHistory() {
    this.store.downloadCsv(
      'finandrome-synthetic-receipts.csv',
      [
        'Loan',
        'Receipt',
        'Date UTC',
        'Principal INR',
        'Illustrative charge INR',
        'Total INR',
        'Source',
      ],
      this.transactions().map((row) => [
        this.loan()!.id,
        'DEMO-' + this.loan()!.id + '-' + row.number,
        row.due.toISOString().slice(0, 10),
        row.principal,
        row.charge,
        row.total,
        'Synthetic schedule-derived receipt; not a bank transaction',
      ]),
    );
  }
  readonly query = signal('');
  readonly status = signal('All accounts');
  readonly rows = computed(() =>
    this.store
      .loans()
      .filter(
        (loan) =>
          `${loan.name} ${loan.id}`.toLowerCase().includes(this.query().toLowerCase()) &&
          (this.product() === 'All products' || loan.product === this.product()) &&
          (this.status() === 'All accounts' ||
            (this.status() === 'Overdue' ? loan.overdue > 0 : loan.overdue === 0)),
      ),
  );
  readonly due = computed(() =>
    this.store.loans().reduce((sum, loan) => sum + loan.installment, 0),
  );
  readonly schedule = computed(() => (this.loan() ? scheduleFor(this.loan()!) : []));
  export(): void {
    this.store.downloadCsv(
      'finandrome-loans-demo.csv',
      ['Loan', 'Application', 'Borrower', 'Principal INR', 'Outstanding INR', 'Days overdue'],
      this.rows().map((loan) => [
        loan.id,
        loan.applicationId,
        loan.name,
        loan.principal,
        loan.outstanding,
        loan.overdue,
      ]),
    );
  }
}

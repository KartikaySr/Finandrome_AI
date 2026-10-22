// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DemoStore } from '../data/demo-store';
import { compactMoney, money } from '../data/models';
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
  readonly query = signal('');
  readonly status = signal('All accounts');
  readonly rows = computed(() =>
    this.store
      .loans()
      .filter(
        (loan) =>
          `${loan.name} ${loan.id}`.toLowerCase().includes(this.query().toLowerCase()) &&
          (this.status() === 'All accounts' ||
            (this.status() === 'Overdue' ? loan.overdue > 0 : loan.overdue === 0)),
      ),
  );
  readonly due = computed(() =>
    this.store.loans().reduce((sum, loan) => sum + loan.installment, 0),
  );
  readonly schedule = computed(() => {
    const loan = this.loan();
    return loan
      ? Array.from({ length: loan.term }, (_, i) => ({
          number: i + 1,
          due: new Date(Date.UTC(2026, 6 + i, 5)),
          amount: loan.installment,
          status: i < loan.paid ? 'Illustrative paid' : 'Scheduled',
        }))
      : [];
  });
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

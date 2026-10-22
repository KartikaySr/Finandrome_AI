// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoStore } from '../data/demo-store';
import { ApplicationStatus, money } from '../data/models';
import { IconComponent } from '../ui/icon';
import { tabKey } from '../ui/tab-keyboard';
@Component({
  selector: 'los-application-detail',
  imports: [RouterLink, DatePipe, FormsModule, IconComponent],
  templateUrl: './application-detail.html',
})
export class ApplicationDetailComponent {
  readonly store = inject(DemoStore);
  readonly route = inject(ActivatedRoute);
  readonly money = money;
  readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly app = computed(() => this.store.findApplication(this.params().get('id') ?? ''));
  readonly documents = computed(() =>
    this.store.documents().filter((doc) => doc.applicationId === this.app()?.id),
  );
  readonly events = computed(() =>
    this.store.events().filter((event) => event.entity === this.app()?.id),
  );
  readonly tab = signal('Overview');
  readonly tabs = ['Overview', 'Documents', 'Decision history'];
  readonly next = signal<ApplicationStatus>('Under review');
  readonly reason = signal('');
  readonly error = signal('');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('decisionDialog');
  readonly actions = computed<ApplicationStatus[]>(() => {
    const app = this.app();
    if (!app) return [];
    if (this.store.isCustomer() && ['Draft', 'Referred'].includes(app.status)) return ['Submitted'];
    if (this.store.canReview() && app.status === 'Submitted') return ['Under review'];
    if (this.store.canReview() && app.status === 'Under review')
      return this.store.canDecide() ? ['Referred', 'Rejected', 'Approved'] : ['Referred'];
    if (this.store.canDecide() && app.status === 'Approved') return ['Disbursed'];
    return [];
  });
  label(status: string): string {
    return (
      (
        {
          'Under review': 'Start review',
          Submitted: this.app()?.status === 'Referred' ? 'Resubmit' : 'Submit application',
          Referred: 'Request information',
          Rejected: 'Reject',
          Approved: 'Approve',
          Disbursed: 'Simulate disbursement',
        } as Record<string, string>
      )[status] ?? status
    );
  }
  open(next: ApplicationStatus): void {
    this.next.set(next);
    this.reason.set('');
    this.error.set('');
    this.dialog()?.nativeElement.showModal();
  }
  confirm(): void {
    try {
      const app = this.app();
      if (!app) return;
      this.store.transition(app.id, this.next(), this.reason());
      this.dialog()?.nativeElement.close();
    } catch (error) {
      this.error.set((error as Error).message);
    }
  }
  onTabKey(event: KeyboardEvent, index: number): void {
    const selected = tabKey(event, this.tabs, index);
    if (selected) this.tab.set(selected);
  }
}

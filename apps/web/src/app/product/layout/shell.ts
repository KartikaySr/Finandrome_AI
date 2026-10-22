// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DemoStore } from '../data/demo-store';
import { ROLES, Role } from '../data/models';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-workspace',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FormsModule, DatePipe, IconComponent],
  templateUrl: './shell.html',
})
export class ShellComponent {
  readonly store = inject(DemoStore);
  readonly router = inject(Router);
  readonly roles = ROLES;
  readonly mobile = signal(false);
  readonly notifications = signal(false);
  readonly query = signal('');
  readonly nav = computed(() =>
    [
      { path: 'overview', label: 'Overview', icon: 'grid', show: true },
      { path: 'applications', label: 'Applications', icon: 'file', show: true },
      { path: 'review', label: 'Review queue', icon: 'shield', show: this.store.canReview() },
      { path: 'approvals', label: 'Approvals', icon: 'check', show: this.store.canDecide() },
      { path: 'loans', label: 'Loan portfolio', icon: 'wallet', show: true },
      { path: 'documents', label: 'Documents', icon: 'file', show: true },
      { path: 'analytics', label: 'Analytics', icon: 'chart', show: !this.store.isCustomer() },
      { path: 'ai', label: 'Intelligence', icon: 'spark', show: !this.store.isCustomer() },
      { path: 'audit', label: 'Activity log', icon: 'clock', show: !this.store.isCustomer() },
      { path: 'team', label: 'Team & access', icon: 'users', show: this.store.canAdmin() },
    ].filter((item) => item.show),
  );
  readonly searchResults = computed(() =>
    this.query().trim().length >= 2
      ? this.store
          .applications()
          .filter((item) =>
            `${item.name} ${item.id} ${item.business}`
              .toLowerCase()
              .includes(this.query().toLowerCase()),
          )
          .slice(0, 5)
      : [],
  );
  switchRole(value: string): void {
    this.store.enter(value as Role);
    void this.router.navigate(['/workspace/overview']);
    this.mobile.set(false);
  }
  logout(): void {
    this.store.logout();
    void this.router.navigate(['/']);
  }
  openResult(id: string): void {
    this.query.set('');
    void this.router.navigate(['/workspace/applications', id]);
  }
}

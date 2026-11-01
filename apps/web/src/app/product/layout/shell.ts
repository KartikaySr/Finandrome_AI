// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DemoStore } from '../data/demo-store';
import { ROLES, Role, initials } from '../data/models';
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
  readonly initials = initials;
  readonly commandDialog = viewChild<ElementRef<HTMLDialogElement>>('commandDialog');
  readonly commandInput = viewChild<ElementRef<HTMLInputElement>>('commandInput');
  readonly commandQuery = signal('');
  readonly commandIndex = signal(0);
  readonly currentUrl = signal(this.router.url);
  readonly currentPage = computed(() => {
    const path = this.currentUrl().split('?')[0].split('/').filter(Boolean).slice(1);
    if (path[0] === 'applications' && path[1] === 'new') return 'New application';
    if (path[0] === 'applications' && path[2] === 'edit') return 'Edit draft';
    if (path[0] === 'applications' && path[1]) return 'Application detail';
    if (path[0] === 'loans' && path[1]) return 'Loan account';
    return (
      this.nav().find((item) => item.path === path[0])?.label ??
      (path[0] === 'profile' ? 'Profile' : path[0] === 'settings' ? 'Settings' : 'Overview')
    );
  });
  readonly commands = computed(() => {
    const query = this.commandQuery().trim().toLowerCase();
    const pages = [
      ...this.nav().map((item) => ({
        label: item.label,
        detail: 'Workspace page',
        path: '/workspace/' + item.path,
        icon: item.icon,
      })),
      {
        label: 'Settings',
        detail: 'Display and demo preferences',
        path: '/workspace/settings',
        icon: 'settings',
      },
      {
        label: 'Profile',
        detail: 'Your display preferences',
        path: '/workspace/profile',
        icon: 'users',
      },
      ...(this.store.canCreate()
        ? [
            {
              label: 'New application',
              detail: 'Start customer intake',
              path: '/workspace/applications/new',
              icon: 'file',
            },
          ]
        : []),
    ];
    const records =
      query.length >= 2
        ? [
            ...this.store.applications().map((item) => ({
              label: item.name,
              detail: item.id + ' · ' + item.status,
              path: '/workspace/applications/' + item.id,
              icon: 'file',
            })),
            ...this.store.loans().map((item) => ({
              label: item.name,
              detail: item.id + ' · Loan account',
              path: '/workspace/loans/' + item.id,
              icon: 'wallet',
            })),
          ]
        : [];
    return [...pages, ...records]
      .filter((item) => (item.label + ' ' + item.detail).toLowerCase().includes(query))
      .slice(0, 12);
  });
  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.currentUrl.set(this.router.url);
        this.mobile.set(false);
        this.notifications.set(false);
        this.query.set('');
        this.closeCommands();
        // Wait for the routed view to render before moving focus to its content.
        requestAnimationFrame(() => document.getElementById('main-content')?.focus());
      });
  }
  @HostListener('document:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.commandDialog()?.nativeElement.open) this.closeCommands();
      else this.openCommands();
    }
    if (event.key === 'Escape') {
      this.mobile.set(false);
      this.notifications.set(false);
      this.query.set('');
    }
  }
  openCommands(): void {
    this.commandQuery.set('');
    this.commandIndex.set(0);
    this.commandDialog()?.nativeElement.showModal();
    this.commandInput()?.nativeElement.focus();
  }
  closeCommands(): void {
    this.commandDialog()?.nativeElement.close();
  }
  searchCommands(value: string): void {
    this.commandQuery.set(value);
    this.commandIndex.set(0);
  }
  commandKey(event: KeyboardEvent): void {
    const count = this.commands().length;
    if (event.key === 'Enter') {
      event.preventDefault();
      const command = this.commands()[this.commandIndex()];
      if (command) this.goToCommand(command.path);
    } else if (count && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      this.commandIndex.set(
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? count - 1
            : (this.commandIndex() + (event.key === 'ArrowDown' ? 1 : -1) + count) % count,
      );
      document
        .getElementById('command-option-' + this.commandIndex())
        ?.scrollIntoView({ block: 'nearest' });
    }
  }
  goToCommand(path: string): void {
    this.closeCommands();
    void this.router.navigateByUrl(path);
  }
  readonly mobile = signal(false);
  readonly notifications = signal(false);
  readonly query = signal('');
  readonly nav = computed(() =>
    [
      { path: 'demo-guide', label: 'Interview walkthrough', icon: 'globe', show: true },
      { path: 'overview', label: 'Overview', icon: 'grid', show: true },
      { path: 'products', label: 'Products', icon: 'wallet', show: true },
      {
        path: 'customer-profile',
        label: 'Customer profile',
        icon: 'users',
        show: this.store.isCustomer(),
      },
      { path: 'notifications', label: 'Notifications', icon: 'bell', show: true },
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
    void this.router.navigate(['/workspace/overview']).then((ok) => {
      if (ok) this.store.enter(value as Role);
    });
    this.mobile.set(false);
  }
  logout(): void {
    void this.router.navigate(['/']).then((ok) => {
      if (ok) this.store.logout();
    });
  }
  openResult(id: string): void {
    this.query.set('');
    void this.router.navigate(['/workspace/applications', id]);
  }
}

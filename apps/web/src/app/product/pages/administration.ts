// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DemoStore } from '../data/demo-store';
import { ROLES } from '../data/models';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-administration',
  imports: [FormsModule, DatePipe, IconComponent],
  templateUrl: './administration.html',
})
export class AdministrationComponent {
  readonly store = inject(DemoStore);
  readonly route = inject(ActivatedRoute);
  readonly view = this.route.snapshot.data['view'] ?? 'settings';
  readonly roles = ROLES;
  readonly query = signal('');
  readonly events = computed(() =>
    this.store
      .events()
      .filter((event) =>
        `${event.action} ${event.entity} ${event.actor}`
          .toLowerCase()
          .includes(this.query().toLowerCase()),
      ),
  );
  name = this.store.state().preferences.displayName;
  email = this.store.state().preferences.email;
  notifications = this.store.state().preferences.notifications;
  compact = this.store.state().preferences.compact;
  reducedMotion = this.store.state().preferences.reducedMotion;
  readonly error = signal('');
  save(): void {
    if (!this.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.error.set('Enter a display name and a valid email.');
      return;
    }
    this.store.savePreferences({
      displayName: this.name.trim(),
      email: this.email.trim(),
      notifications: this.notifications,
      compact: this.compact,
      reducedMotion: this.reducedMotion,
    });
    this.error.set('');
  }
  reset(): void {
    if (
      window.confirm(
        'Reset synthetic applications, documents, events and preferences in this browser? This cannot be undone.',
      )
    ) {
      this.store.reset();
      this.name = this.store.state().preferences.displayName;
      this.email = this.store.state().preferences.email;
      this.notifications = true;
      this.compact = false;
      this.reducedMotion = false;
    }
  }
  export(): void {
    this.store.downloadCsv(
      'finandrome-activity-demo.csv',
      ['Event', 'Action', 'Entity', 'Actor', 'Role', 'Timestamp', 'Detail'],
      this.events().map((event) => [
        event.id,
        event.action,
        event.entity,
        event.actor,
        event.role,
        event.date,
        event.detail,
      ]),
    );
  }
}

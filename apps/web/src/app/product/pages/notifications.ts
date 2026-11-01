// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../data/demo-store';
@Component({
  selector: 'los-notifications',
  imports: [DatePipe, RouterLink],
  template: ` <div class="page-heading">
      <div>
        <p class="eyebrow">WORKSPACE INBOX</p>
        <h1>Stay in the picture.</h1>
        <p>Activity in your permitted demo scope. Read states are saved per persona.</p>
      </div>
      <button
        class="button outline"
        type="button"
        [disabled]="!store.unreadEvents().length"
        (click)="store.markRead(store.unreadEvents().map(eventId))"
      >
        Mark all as read
      </button>
    </div>
    @if (!store.state().preferences.notifications) {
      <p class="notice">
        Activity notifications are disabled in Settings. The activity history remains available.
      </p>
    }
    <div class="filter-bar">
      <button class="button small" [class.primary]="!unreadOnly()" (click)="unreadOnly.set(false)">
        All activity</button
      ><button class="button small" [class.primary]="unreadOnly()" (click)="unreadOnly.set(true)">
        Unread ({{ store.unreadEvents().length }})
      </button>
    </div>
    <section class="panel">
      @for (event of events(); track event.id) {
        <article class="inbox-item">
          <div>
            <span class="soft-badge">{{ isUnread(event.id) ? 'UNREAD' : 'READ' }}</span>
            <h3>{{ event.action }}</h3>
            <p>{{ event.detail }}</p>
            <small>{{ event.date | date: 'dd MMM yyyy, HH:mm' }} · {{ event.entity }}</small>
          </div>
          <div class="inbox-actions">
            @if (event.entity !== 'WORKSPACE') {
              <a
                class="text-link"
                [routerLink]="['/workspace/applications', event.entity]"
                (click)="store.markRead([event.id])"
                >Open application ↗</a
              >
            }
            @if (isUnread(event.id)) {
              <button class="button outline small" (click)="store.markRead([event.id])">
                Mark read
              </button>
            }
          </div>
        </article>
      } @empty {
        <div class="empty-state">
          <h2>You're all caught up.</h2>
          <p>No {{ unreadOnly() ? 'unread' : 'recorded' }} activity in this scope.</p>
        </div>
      }
    </section>`,
})
export class NotificationsComponent {
  readonly store = inject(DemoStore);
  readonly unreadOnly = signal(false);
  readonly events = computed(() =>
    this.unreadOnly() ? this.store.unreadEvents() : this.store.events(),
  );
  readonly eventId = (event: { id: string }) => event.id;
  isUnread(id: string) {
    return this.store.unreadEvents().some((event) => event.id === id);
  }
}

// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../data/demo-store';
import { DocumentRecord } from '../data/models';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-documents',
  imports: [FormsModule, DatePipe, RouterLink, IconComponent],
  templateUrl: './documents.html',
})
export class DocumentsComponent {
  readonly store = inject(DemoStore);
  readonly query = signal('');
  readonly status = signal('All states');
  readonly error = signal('');
  readonly selected = signal<DocumentRecord | null>(null);
  readonly application = signal(this.store.applications()[0]?.id ?? '');
  readonly type = signal('Income statement');
  readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('documentDialog');
  readonly rows = computed(() =>
    this.store
      .documents()
      .filter(
        (doc) =>
          `${doc.name} ${doc.applicationId} ${doc.type}`
            .toLowerCase()
            .includes(this.query().toLowerCase()) &&
          (this.status() === 'All states' || doc.status === this.status()),
      ),
  );
  open(doc: DocumentRecord): void {
    this.selected.set(doc);
    this.dialog()?.nativeElement.showModal();
  }
  add(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      this.store.addDocument(file, this.application(), this.type());
      this.error.set('');
    } catch (error) {
      this.error.set((error as Error).message);
    }
    (event.target as HTMLInputElement).value = '';
  }
  review(doc: DocumentRecord, status: DocumentRecord['status']): void {
    try {
      this.store.reviewDocument(doc.id, status);
      this.selected.set({ ...doc, status });
      this.store.notify(`Demo document marked ${status.toLowerCase()}.`);
    } catch (error) {
      this.error.set((error as Error).message);
    }
  }
}

// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DemoStore } from '../data/demo-store';
import { PRODUCTS, Product, money } from '../data/models';
import { productRule, validateTerms } from '../data/catalog';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-application-new',
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  templateUrl: './application-new.html',
})
export class ApplicationNewComponent {
  readonly store = inject(DemoStore);
  readonly router = inject(Router);
  readonly fb = inject(FormBuilder);
  readonly route = inject(ActivatedRoute);
  readonly editId = this.route.snapshot.paramMap.get('id');
  readonly existing = this.editId ? this.store.findApplication(this.editId) : undefined;
  readonly products = PRODUCTS;
  readonly money = money;
  readonly step = signal(0);
  readonly error = signal('');
  readonly files = signal<File[]>([]);
  readonly steps = ['Applicant', 'Loan details', 'Evidence', 'Review'];
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    business: ['', [Validators.required, Validators.maxLength(100)]],
    product: ['Business growth' as Product, Validators.required],
    amount: [500000, [Validators.required, Validators.min(10000), Validators.max(5000000)]],
    term: [24, [Validators.required, Validators.min(6), Validators.max(60)]],
    income: [100000, [Validators.required, Validators.min(1)]],
    obligations: [10000, [Validators.required, Validators.min(0)]],
    consent: [false, Validators.requiredTrue],
  });
  constructor() {
    if (this.existing && ['Draft', 'Referred'].includes(this.existing.status))
      this.form.patchValue(this.existing);
    else {
      const profile = this.store.isCustomer() ? this.store.state().customerProfile : undefined;
      if (profile)
        this.form.patchValue({
          name: profile.name,
          email: profile.email,
          business: profile.employment,
        });
      const product = this.route.snapshot.queryParamMap.get('product');
      if (product && productRule(product)) this.form.controls.product.setValue(product as Product);
    }
  }
  saved = false;
  canLeave(): boolean {
    return (
      this.saved ||
      (!this.form.dirty && !this.files().length) ||
      window.confirm(
        'Leave this application? Unsaved changes and selected file metadata will be lost. Save a draft to keep your details.',
      )
    );
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (!this.saved && (this.form.dirty || this.files().length)) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
  get rule() {
    return productRule(this.form.controls.product.value)!;
  }
  get termsError() {
    return validateTerms(
      this.form.controls.product.value,
      this.form.controls.amount.value,
      this.form.controls.term.value,
    );
  }
  removeFile(index: number): void {
    this.files.update((files) => files.filter((_, i) => i !== index));
  }
  invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }
  next(): void {
    const names: (keyof typeof this.form.controls)[] =
      this.step() === 0
        ? ['name', 'email', 'business', 'product']
        : this.step() === 1
          ? ['amount', 'term', 'income', 'obligations']
          : [];
    names.forEach((name) => this.form.controls[name].markAsTouched());
    if (names.some((name) => this.form.controls[name].invalid)) {
      this.error.set(
        this.step() === 1 && this.termsError
          ? this.termsError
          : 'Please complete the highlighted fields.',
      );
      return;
    }
    if (this.step() === 1 && this.termsError) {
      this.error.set(this.termsError);
      return;
    }
    this.error.set('');
    this.step.update((value) => Math.min(3, value + 1));
  }
  selectFiles(event: Event): void {
    const items = Array.from((event.target as HTMLInputElement).files ?? []);
    if (
      items.some(
        (file) =>
          !['application/pdf', 'image/png', 'image/jpeg'].includes(file.type) ||
          !file.size ||
          file.size > 10 * 1024 * 1024,
      )
    ) {
      this.error.set('Choose nonempty PDF, JPEG or PNG files under 10 MB.');
      return;
    }
    if (items.length > 5) {
      this.error.set('Choose at most 5 files. No files were added.');
      return;
    }
    this.files.set(items);
    this.error.set('');
  }
  save(submit: boolean): void {
    this.form.markAllAsTouched();
    if (submit && this.form.invalid) {
      this.error.set('Complete all fields and acknowledge the synthetic demo.');
      return;
    }
    try {
      const { consent: _consent, ...input } = this.form.getRawValue();
      void _consent;
      const id = this.store.createApplication(input, submit, this.editId ?? undefined);
      this.files().forEach((file) => this.store.addDocument(file, id, 'Application attachment'));
      this.store.notify(
        submit ? 'Synthetic application submitted.' : 'Draft saved in this browser.',
      );
      this.saved = true;
      void this.router.navigate(['/workspace/applications', id]);
    } catch (error) {
      this.error.set((error as Error).message);
    }
  }
}

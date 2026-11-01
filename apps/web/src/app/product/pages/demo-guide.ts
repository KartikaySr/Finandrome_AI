// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DemoStore } from '../data/demo-store';
import { Role } from '../data/models';
@Component({
  selector: 'los-demo-guide',
  template: ` <div class="page-heading">
      <div>
        <p class="eyebrow">THE INTERVIEW WALKTHROUGH</p>
        <h1>One case. The whole journey.</h1>
        <p>A reproducible, connected simulation you can present in five to seven minutes.</p>
      </div>
      <span class="soft-badge">NO EXTERNAL SERVICES REQUIRED</span>
    </div>
    <section class="panel">
      <h2>Your demonstration case</h2>
      <p>
        Use <strong>Interview Studio</strong>, <strong>interview@example.com</strong>, Business
        growth, <strong>₹3,00,000</strong>, <strong>12 months</strong>, monthly income
        <strong>₹90,000</strong> and obligations <strong>₹10,000</strong>. Use fictional information
        only.
      </p>
      <div class="review-sheet">
        <div><span>Expected initial loan balance</span><strong>₹3,00,000</strong></div>
        <div><span>Illustrative installment</span><strong>₹28,000 × 12</strong></div>
        <div><span>Total flat charge</span><strong>₹36,000 (12% over the full term)</strong></div>
      </div>
      <p class="subtle">
        This is a transparent simulation formula, not a quoted annual rate, eligibility assessment
        or real loan offer.
      </p>
    </section>
    <div class="product-grid mt">
      @for (step of steps; track step.title) {
        <article class="panel product-card">
          <p class="eyebrow">0{{ $index + 1 }} / {{ step.role }}</p>
          <h2>{{ step.title }}</h2>
          <p>{{ step.description }}</p>
          <button type="button" class="button outline" (click)="open(step.role, step.path)">
            {{ step.action }} ↗
          </button>
        </article>
      }
    </div>
    <section class="panel mt">
      <h2>What to explain to the interviewer</h2>
      <p>
        Finandrome joins customer intake, evidence review, authorized decisions and portfolio
        context. The frontend enforces demo workflow rules and keeps the screens consistent through
        one local store. Server authentication, secure document storage, live AI and Fineract
        integration are the next system layer.
      </p>
      <p>
        Use Settings → Reset demo workspace to restore the original 16 applications and 5 loan
        accounts before presenting. Reset requires confirmation and removes locally created demo
        records. Browser history is capped at 250 events.
      </p>
      <p>
        Sample documents and AI answers are labeled illustrations. Selecting a file records metadata
        only. No file contents, identity verification or money movement is involved.
      </p>
    </section>`,
})
export class DemoGuideComponent {
  readonly store = inject(DemoStore);
  readonly router = inject(Router);
  readonly steps: {
    title: string;
    role: Role;
    path: string;
    description: string;
    action: string;
  }[] = [
    {
      title: 'Create the application',
      role: 'Customer',
      path: 'applications/new',
      description:
        'Complete the four-step intake using the case above. Save a draft to demonstrate persistence, reopen it, then submit.',
      action: 'Start customer intake',
    },
    {
      title: 'Inspect the evidence',
      role: 'Loan officer',
      path: 'documents',
      description:
        'Filter to Interview Studio. Add a fictional file metadata record if desired, inspect the checklist and show a seeded synthetic sample. Review states are simulation controls.',
      action: 'Open evidence workspace',
    },
    {
      title: 'Review with context',
      role: 'Loan officer',
      path: 'review',
      description:
        'Find Interview Studio, start review with a reason, and add a reviewer note. Optionally refer it, switch to Customer, update the details and resubmit.',
      action: 'Open review queue',
    },
    {
      title: 'Explain assistance',
      role: 'Loan officer',
      path: 'ai',
      description:
        'Select the case and run an application brief. Open source context. Demonstrate the no-evidence or service-error scenario and recovery. Explain that this release uses scripted assistance.',
      action: 'Explore intelligence',
    },
    {
      title: 'Make the decision',
      role: 'Branch manager',
      path: 'approvals',
      description:
        'Approve the reviewed case with a reason, then explicitly confirm simulated disbursement. Open the linked loan; a second disbursement is blocked.',
      action: 'Open manager approvals',
    },
    {
      title: 'Connect the portfolio',
      role: 'Branch manager',
      path: 'analytics',
      description:
        'Show the additional loan principal, outstanding balance, metric definitions and CSV export. Explain why the newly created account has no paid installments.',
      action: 'Open portfolio analytics',
    },
  ];
  open(role: Role, path: string) {
    this.store.enter(role);
    void this.router.navigateByUrl('/workspace/' + path);
  }
}

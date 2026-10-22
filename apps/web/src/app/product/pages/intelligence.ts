// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DemoStore } from '../data/demo-store';
import { money } from '../data/models';
import { IconComponent } from '../ui/icon';
interface PreviewAnswer {
  title: string;
  paragraphs: string[];
  citations: { label: string; path?: string; detail: string }[];
}
@Component({
  selector: 'los-intelligence',
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './intelligence.html',
})
export class IntelligenceComponent implements OnDestroy {
  readonly store = inject(DemoStore);
  readonly route = inject(ActivatedRoute);
  readonly tools = [
    {
      id: 'summary',
      name: 'Application brief',
      icon: 'file',
      tag: 'REVIEW',
      description: 'An evidence-linked application summary.',
      prompt: 'Summarize the selected application and highlight missing evidence.',
    },
    {
      id: 'documents',
      name: 'Document insights',
      icon: 'eye',
      tag: 'EXTRACT',
      description: 'Preview a structured field-mapping workflow.',
      prompt: 'Show the illustrative field mapping for this application.',
    },
    {
      id: 'policy',
      name: 'Policy copilot',
      icon: 'shield',
      tag: 'RETRIEVE',
      description: 'Find the source behind the process.',
      prompt: 'What is the approval process in the sample policy?',
    },
    {
      id: 'score',
      name: 'Score explanation',
      icon: 'chart',
      tag: 'EXPLAIN',
      description: 'Understand the boundaries of a factor score.',
      prompt: 'Explain the score shown on the selected application.',
    },
    {
      id: 'portfolio',
      name: 'Portfolio lens',
      icon: 'globe',
      tag: 'ANALYZE',
      description: 'Read the numbers in your permitted scope.',
      prompt: 'What is the current outstanding portfolio and PAR30?',
    },
  ];
  readonly selected = signal('summary');
  readonly applicationId = signal(
    this.route.snapshot.queryParamMap.get('application') ?? this.store.applications()[0]?.id ?? '',
  );
  readonly tool = computed(
    () => this.tools.find((item) => item.id === this.selected()) ?? this.tools[0],
  );
  readonly prompt = signal(this.tools[0].prompt);
  readonly running = signal(false);
  readonly answer = signal<PreviewAnswer | null>(null);
  readonly source = signal('');
  private timer?: ReturnType<typeof setTimeout>;
  choose(id: string): void {
    this.cancel();
    this.selected.set(id);
    this.prompt.set(this.tool().prompt);
    this.answer.set(null);
    this.source.set('');
  }
  cancel(): void {
    if (this.timer) clearTimeout(this.timer);
    this.running.set(false);
  }
  run(): void {
    this.cancel();
    this.answer.set(null);
    this.source.set('');
    this.running.set(true);
    this.timer = setTimeout(() => {
      this.answer.set(this.buildAnswer());
      this.running.set(false);
    }, 650);
  }
  private buildAnswer(): PreviewAnswer {
    if (this.prompt().trim() !== this.tool().prompt)
      return {
        title: 'This preview supports a defined scenario.',
        paragraphs: [
          'Free-form model inference is not connected. Select a capability and use its sample question to explore the intended interaction. No external AI provider receives your input.',
        ],
        citations: [],
      };
    const app = this.store.findApplication(this.applicationId());
    const ref = app
      ? [
          {
            label: app.id,
            path: `/workspace/applications/${app.id}`,
            detail:
              'Current permitted synthetic application record. Values are declared fixture data, not verified applicant evidence.',
          },
        ]
      : [];
    switch (this.selected()) {
      case 'summary':
        return app
          ? {
              title: `A clearer picture of ${app.name}.`,
              paragraphs: [
                `${app.name} is requesting ${money(app.amount)} for ${app.product.toLowerCase()} over ${app.term} months. Current state: ${app.status.toLowerCase()}.`,
                `Declared monthly income is ${money(app.income)} and existing monthly obligations are ${money(app.obligations)}. These are synthetic values, not verified financial evidence.`,
                `There are ${this.store.documents().filter((doc) => doc.applicationId === app.id).length} document metadata records linked to this application. Inspect the documents and recorded context before any next step.`,
              ],
              citations: ref,
            }
          : this.noApplication();
      case 'documents':
        return app
          ? {
              title: 'From evidence to structured context.',
              paragraphs: [
                `Illustrative mapping: applicant → ${app.name}; requested amount → ${money(app.amount)}; declared income → ${money(app.income)} per month.`,
                'These values are read from the application fixture, not extracted from a document. OCR, source-page citations and human field acceptance are planned backend capabilities.',
                'No file bytes were read, uploaded or analyzed. This scenario demonstrates the intended presentation, not extraction quality.',
              ],
              citations: ref,
            }
          : this.noApplication();
      case 'policy':
        return {
          title: 'Approval is a controlled human workflow.',
          paragraphs: [
            'The sample policy routes submitted applications to a loan officer for review. A branch manager records an approval or rejection after reviewing the evidence.',
            'Missing or inconsistent information can be referred to the applicant. Disbursement is a separate, explicitly confirmed step after approval.',
            'This is a scripted summary of a fictional demo policy. It is not retrieved from a live institutional knowledge base.',
          ],
          citations: [
            {
              label: 'Sample lending policy · §2',
              detail:
                'DEMO-POLICY-001, version 1.0. Section 2: A loan officer reviews submitted applications. A branch manager records the final decision. Refer missing information before proceeding. Disbursement requires prior approval. This is synthetic policy content for interface demonstration only.',
            },
          ],
        };
      case 'score':
        return app
          ? {
              title: 'A number needs an explanation—and a boundary.',
              paragraphs: [
                `The selected synthetic application stores a factor score of ${app.score || 'not yet scored'}${app.score ? ' / 100' : ''}.`,
                'The fixture does not include auditable factor contributions. This preview cannot reconstruct or invent why each point was awarded. The full backend must return versioned inputs, weights and contributions.',
                'A factor score is not a calibrated probability of default. A human reviewer—not this preview—owns the lending decision.',
              ],
              citations: ref,
            }
          : this.noApplication();
      case 'portfolio':
        return {
          title: 'Your portfolio, in the current demo scope.',
          paragraphs: [
            `Outstanding principal is ${money(this.store.portfolio())} across ${this.store.loans().length} synthetic loan accounts visible to your persona.`,
            `PAR30 is ${this.store.par30().toFixed(2)}%, calculated as the outstanding principal on loans at least 30 days overdue divided by total outstanding principal.`,
            'These values are calculated from the current browser fixture. They are not a live warehouse refresh, default forecast or lending recommendation.',
          ],
          citations: [
            {
              label: 'Scoped portfolio fixture',
              path: '/workspace/analytics',
              detail:
                'Current permitted synthetic loan records. Currency INR; PAR30 uses >=30 overdue days. Empty portfolios return 0% with zero accounts; this is not a statement about risk.',
            },
          ],
        };
      default:
        return this.noApplication();
    }
  }
  private noApplication(): PreviewAnswer {
    return {
      title: 'Select an available application.',
      paragraphs: [
        'No application is available in this demo scope. Create one or switch to a persona with an existing synthetic application.',
      ],
      citations: [],
    };
  }
  ngOnDestroy(): void {
    this.cancel();
  }
}

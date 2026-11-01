// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../data/demo-store';
import { CATALOG } from '../data/catalog';
import { money } from '../data/models';
@Component({
  selector: 'los-products',
  imports: [RouterLink],
  template: ` <div class="page-heading">
      <div>
        <p class="eyebrow">PURPOSE BEFORE PRINCIPAL</p>
        <h1>Find your next possibility.</h1>
        <p>Compare four illustrative lending products before starting an application.</p>
      </div>
      <span class="soft-badge">DEMO PRODUCT CATALOG</span>
    </div>
    <div class="product-grid">
      @for (product of products; track product.name) {
        <article class="panel product-card">
          <p class="eyebrow">0{{ $index + 1 }} / FINANDROME</p>
          <h2>{{ product.name }}</h2>
          <p>{{ product.description }}</p>
          <div class="review-sheet">
            <div>
              <span>Amount range</span
              ><strong>{{ money(product.min) }}–{{ money(product.max) }}</strong>
            </div>
            <div>
              <span>Tenure</span><strong>{{ product.minTerm }}–{{ product.maxTerm }} months</strong>
            </div>
          </div>
          <p class="subtle">{{ product.eligibility }}</p>
          <h3>Evidence checklist</h3>
          <ul>
            @for (doc of product.evidence; track doc) {
              <li>{{ doc }}</li>
            }
          </ul>
          @if (store.state().pausedProducts?.includes(product.name)) {
            <p class="notice">Paused for new demo submissions.</p>
          }
          @if (store.canCreate()) {
            <a
              class="button primary"
              routerLink="/workspace/applications/new"
              [queryParams]="{ product: product.name }"
              >Explore {{ product.name }}</a
            >
          }
          @if (store.canAdmin()) {
            <button
              class="button outline"
              type="button"
              (click)="
                store.setProductPaused(
                  product.name,
                  !store.state().pausedProducts?.includes(product.name)
                )
              "
            >
              {{ store.state().pausedProducts?.includes(product.name) ? 'Enable' : 'Pause' }}
              {{ product.name }}
            </button>
          }
        </article>
      }
    </div>
    <p class="notice">
      These are synthetic product rules for demonstrating intake. They are not eligibility
      verification, an interest quote, or an offer of credit. Administrator availability changes
      apply only to this browser.
    </p>`,
})
export class ProductsComponent {
  readonly store = inject(DemoStore);
  readonly products = CATALOG;
  readonly money = money;
}

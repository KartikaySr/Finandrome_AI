// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-open-source',
  imports: [RouterLink, IconComponent],
  template: `<main id="main-content" class="credits-page wrap">
    <a routerLink="/" class="wordmark"
      ><span class="brand-mark">f<span>.</span></span
      >finandrome</a
    >
    <p class="eyebrow">BUILT IN THE OPEN</p>
    <h1>Good foundations<br />deserve recognition.</h1>
    <p class="section-description">
      Finandrome is a product by Kartikay Srivastava, integrating and extending open-source lending
      and analytics foundations. Rebranding does not replace the original authorship of inherited
      code.
    </p>
    <div class="credits-list">
      <article>
        <span>01</span>
        <div>
          <h2>Apache Fineract</h2>
          <p>The intended core loan-account and repayment platform.</p>
          <a href="https://github.com/apache/fineract" target="_blank" rel="noopener noreferrer"
            >Explore the project ↗</a
          >
        </div>
      </article>
      <article>
        <span>02</span>
        <div>
          <h2>Fineract Loan Origination</h2>
          <p>
            Upstream customer/staff frontend, Java APIs, approval workflow, scoring and integration
            foundations. Original Apache license headers remain in inherited files.
          </p>
          <a
            href="https://github.com/apache/fineract-loan-origination"
            target="_blank"
            rel="noopener noreferrer"
            >Explore the project ↗</a
          >
        </div>
      </article>
      <article>
        <span>03</span>
        <div>
          <h2>Fineract Business Intelligence</h2>
          <p>Upstream extraction, dbt modeling, warehouse and Superset dashboard foundations.</p>
          <a
            href="https://github.com/apache/fineract-business-intelligence"
            target="_blank"
            rel="noopener noreferrer"
            >Explore the project ↗</a
          >
        </div>
      </article>
      <article>
        <span>04</span>
        <div>
          <h2>The open-source ecosystem</h2>
          <p>
            Angular, TypeScript, RxJS, Spring Boot, PostgreSQL, Python, dbt and Apache Superset.
            Applicable dependency licenses remain with their respective projects.
          </p>
        </div>
      </article>
    </div>
    <div class="notice">
      <los-icon name="eye" /><span
        >The current Finandrome frontend is a synthetic interaction preview. Its AI responses are
        scripted and banking actions are browser simulations. The imported backend and analytics
        sources have not yet been connected to this UI.</span
      >
    </div>
    <a routerLink="/login" class="button primary">Explore Finandrome <los-icon name="arrow" /></a
    ><a
      class="text-link"
      href="https://github.com/KartikaySr/Finandrome_AI"
      target="_blank"
      rel="noopener noreferrer"
      >Source, provenance & architecture ↗</a
    >
  </main>`,
})
export class OpenSourceComponent {}

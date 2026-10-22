// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'los-not-found',
  imports: [RouterLink],
  template: `<main id="main-content" class="not-found">
    <p class="eyebrow">404 / OUTSIDE THE PICTURE</p>
    <h1>A different direction.</h1>
    <p>This page does not exist. Let’s get back to the workspace.</p>
    <a routerLink="/" class="button primary">Back to Finandrome ↗</a>
  </main>`,
})
export class NotFoundComponent {}

// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../ui/icon';
@Component({
  selector: 'los-landing',
  imports: [RouterLink, IconComponent],
  templateUrl: './landing.html',
})
export class LandingComponent {}

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, Routes } from '@angular/router';
import { DemoStore } from './product/data/demo-store';

const sessionGuard: CanActivateFn = () =>
  inject(DemoStore).role() ? true : inject(Router).createUrlTree(['/login']);
const personaGuard: CanActivateChildFn = (route) => {
  const store = inject(DemoStore);
  if (!store.role()) return inject(Router).createUrlTree(['/login']);
  const roles = route.data['roles'] as string[] | undefined;
  return !roles || roles.includes(store.role() ?? '')
    ? true
    : inject(Router).createUrlTree(['/workspace/overview']);
};
const staff = ['Branch manager', 'Loan officer', 'Credit reviewer', 'Auditor', 'Administrator'];
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Finandrome AI — A clearer perspective on lending',
    loadComponent: () => import('./product/pages/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    title: 'Choose your perspective — Finandrome',
    loadComponent: () => import('./product/pages/login').then((m) => m.LoginComponent),
  },
  {
    path: 'open-source',
    title: 'Open foundations — Finandrome',
    loadComponent: () => import('./product/pages/open-source').then((m) => m.OpenSourceComponent),
  },
  {
    path: 'workspace',
    canActivate: [sessionGuard],
    canActivateChild: [personaGuard],
    loadComponent: () => import('./product/layout/shell').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        title: 'Overview — Finandrome',
        loadComponent: () => import('./product/pages/overview').then((m) => m.OverviewComponent),
      },
      {
        path: 'applications/new',
        title: 'New application — Finandrome',
        data: { roles: ['Customer', 'Loan officer'] },
        loadComponent: () =>
          import('./product/pages/application-new').then((m) => m.ApplicationNewComponent),
      },
      {
        path: 'applications/:id/edit',
        title: 'Edit draft — Finandrome',
        data: { roles: ['Customer', 'Loan officer'] },
        loadComponent: () =>
          import('./product/pages/application-new').then((m) => m.ApplicationNewComponent),
      },
      {
        path: 'applications/:id',
        title: 'Application detail — Finandrome',
        loadComponent: () =>
          import('./product/pages/application-detail').then((m) => m.ApplicationDetailComponent),
      },
      {
        path: 'applications',
        title: 'Applications — Finandrome',
        loadComponent: () =>
          import('./product/pages/applications').then((m) => m.ApplicationsComponent),
      },
      {
        path: 'review',
        title: 'Review queue — Finandrome',
        data: { mode: 'review', roles: ['Branch manager', 'Loan officer', 'Credit reviewer'] },
        loadComponent: () =>
          import('./product/pages/applications').then((m) => m.ApplicationsComponent),
      },
      {
        path: 'approvals',
        title: 'Approvals — Finandrome',
        data: { mode: 'approvals', roles: ['Branch manager'] },
        loadComponent: () =>
          import('./product/pages/applications').then((m) => m.ApplicationsComponent),
      },
      {
        path: 'loans/:id',
        title: 'Loan account — Finandrome',
        loadComponent: () => import('./product/pages/loans').then((m) => m.LoansComponent),
      },
      {
        path: 'loans',
        title: 'Loan portfolio — Finandrome',
        loadComponent: () => import('./product/pages/loans').then((m) => m.LoansComponent),
      },
      {
        path: 'documents',
        title: 'Documents — Finandrome',
        loadComponent: () => import('./product/pages/documents').then((m) => m.DocumentsComponent),
      },
      {
        path: 'analytics',
        title: 'Analytics — Finandrome',
        data: { roles: staff },
        loadComponent: () => import('./product/pages/analytics').then((m) => m.AnalyticsComponent),
      },
      {
        path: 'ai',
        title: 'Intelligence — Finandrome',
        data: { roles: staff },
        loadComponent: () =>
          import('./product/pages/intelligence').then((m) => m.IntelligenceComponent),
      },
      {
        path: 'audit',
        title: 'Activity log — Finandrome',
        data: { view: 'audit', roles: staff },
        loadComponent: () =>
          import('./product/pages/administration').then((m) => m.AdministrationComponent),
      },
      {
        path: 'team',
        title: 'Team & access — Finandrome',
        data: { view: 'team', roles: ['Administrator'] },
        loadComponent: () =>
          import('./product/pages/administration').then((m) => m.AdministrationComponent),
      },
      {
        path: 'settings',
        title: 'Settings — Finandrome',
        data: { view: 'settings' },
        loadComponent: () =>
          import('./product/pages/administration').then((m) => m.AdministrationComponent),
      },
      {
        path: 'profile',
        title: 'Profile — Finandrome',
        data: { view: 'profile' },
        loadComponent: () =>
          import('./product/pages/administration').then((m) => m.AdministrationComponent),
      },
    ],
  },
  { path: 'dashboard', redirectTo: 'workspace/overview' },
  { path: 'staff/login', redirectTo: 'login' },
  {
    path: '**',
    title: 'Page not found — Finandrome',
    loadComponent: () => import('./product/pages/not-found').then((m) => m.NotFoundComponent),
  },
];

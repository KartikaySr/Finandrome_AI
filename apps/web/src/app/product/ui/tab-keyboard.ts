// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
/** Roving focus for the horizontal analytics and application tab lists. */
export function tabKey(event: KeyboardEvent, tabs: string[], index: number): string | undefined {
  let target: number;
  switch (event.key) {
    case 'ArrowRight':
      target = (index + 1) % tabs.length;
      break;
    case 'ArrowLeft':
      target = (index - 1 + tabs.length) % tabs.length;
      break;
    case 'Home':
      target = 0;
      break;
    case 'End':
      target = tabs.length - 1;
      break;
    default:
      return undefined;
  }
  event.preventDefault();
  const buttons = (
    event.currentTarget as HTMLElement
  ).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  buttons?.item(target)?.focus();
  return tabs[target];
}

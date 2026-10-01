import {
  emitAnalytics,
  isAnalyticsGuideSlug,
  type AnalyticsGuideCategory,
} from '../lib/analytics';
import { isHelpKey } from '../lib/help';

let helpId = 0;
let actionHelpId = 0;

function actionHelpTarget(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>('button, a, input, select');
}

function closeActionHelp(root: HTMLElement): void {
  const tooltip = root.querySelector<HTMLElement>('[data-action-help-tooltip]');
  if (tooltip) tooltip.hidden = true;
}

function openActionHelp(root: HTMLElement): void {
  const target = actionHelpTarget(root);
  const tooltip = root.querySelector<HTMLElement>('[data-action-help-tooltip]');
  if (!target || !tooltip) return;
  if (!tooltip.id) tooltip.id = `action-help-${++actionHelpId}`;
  target.setAttribute('aria-describedby', tooltip.id);
  tooltip.hidden = false;
  const targetBounds = target.getBoundingClientRect();
  const width = Math.min(280, window.innerWidth - 32);
  tooltip.style.width = `${width}px`;
  tooltip.style.maxHeight = `${Math.max(0, window.innerHeight - 32)}px`;
  tooltip.style.left = `${Math.min(
    window.innerWidth - width - 16,
    Math.max(16, targetBounds.left + targetBounds.width / 2 - width / 2),
  )}px`;
  const below = targetBounds.bottom + 6;
  const above = targetBounds.top - tooltip.offsetHeight - 6;
  const preferredTop =
    below + tooltip.offsetHeight <= window.innerHeight - 16 || above < 16
      ? below
      : above;
  tooltip.style.top = `${Math.min(
    window.innerHeight - tooltip.offsetHeight - 16,
    Math.max(16, preferredTop),
  )}px`;
}

function closeHelp(root: HTMLElement, restoreFocus = false): void {
  const trigger = root.querySelector<HTMLButtonElement>('[data-help-trigger]');
  const popover = root.querySelector<HTMLElement>('[data-help-popover]');
  if (!trigger || !popover) return;
  trigger.setAttribute('aria-expanded', 'false');
  popover.hidden = true;
  if (restoreFocus) trigger.focus();
}

function closeOtherHelp(active?: HTMLElement): void {
  document
    .querySelectorAll<HTMLElement>('[data-context-help]')
    .forEach((root) => {
      if (root !== active) closeHelp(root);
    });
}

function openHelp(root: HTMLElement, trigger: HTMLButtonElement): void {
  const popover = root.querySelector<HTMLElement>('[data-help-popover]');
  if (!popover) return;
  closeOtherHelp(root);
  if (!popover.id) popover.id = `context-help-${++helpId}`;
  trigger.setAttribute('aria-controls', popover.id);
  trigger.setAttribute('aria-expanded', 'true');
  popover.hidden = false;
  const triggerBounds = trigger.getBoundingClientRect();
  const width = Math.min(320, window.innerWidth - 32);
  popover.style.width = `${width}px`;
  popover.style.maxHeight = `${Math.max(0, window.innerHeight - 32)}px`;
  popover.style.left = `${Math.min(window.innerWidth - width - 16, Math.max(16, triggerBounds.left + triggerBounds.width / 2 - width / 2))}px`;
  const below = triggerBounds.bottom + 8;
  const above = triggerBounds.top - popover.offsetHeight - 8;
  const preferredTop =
    below + popover.offsetHeight <= window.innerHeight - 16 || above < 16
      ? below
      : above;
  popover.style.top = `${Math.min(
    window.innerHeight - popover.offsetHeight - 16,
    Math.max(16, preferredTop),
  )}px`;
  const helpKey = root.dataset.helpKey;
  if (helpKey && isHelpKey(helpKey)) {
    emitAnalytics({ name: 'context_help_opened', help_key: helpKey });
  }
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const trigger = target.closest<HTMLButtonElement>('[data-help-trigger]');
  if (trigger) {
    const root = trigger.closest<HTMLElement>('[data-context-help]');
    if (!root) return;
    if (trigger.getAttribute('aria-expanded') === 'true') closeHelp(root);
    else openHelp(root, trigger);
    return;
  }

  const learnMore = target.closest<HTMLAnchorElement>('[data-help-learn-more]');
  if (learnMore) {
    const helpKey = learnMore.closest<HTMLElement>('[data-context-help]')
      ?.dataset.helpKey;
    if (helpKey && isHelpKey(helpKey)) {
      emitAnalytics({ name: 'context_help_learn_more', help_key: helpKey });
    }
    return;
  }

  if (!target.closest('[data-help-popover]')) closeOtherHelp();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const openTrigger = document.querySelector<HTMLButtonElement>(
    '[data-help-trigger][aria-expanded="true"]',
  );
  const root = openTrigger?.closest<HTMLElement>('[data-context-help]');
  if (root) {
    event.preventDefault();
    closeHelp(root, true);
  }
  document
    .querySelectorAll<HTMLElement>('[data-action-help]')
    .forEach(closeActionHelp);
});

document.addEventListener('pointerover', (event) => {
  if (event.pointerType === 'touch') return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const root = target.closest<HTMLElement>('[data-action-help]');
  if (root) openActionHelp(root);
});

document.addEventListener('pointerout', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const root = target.closest<HTMLElement>('[data-action-help]');
  if (root && !root.contains(event.relatedTarget as Node | null))
    closeActionHelp(root);
});

document.addEventListener('focusin', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const root = target.closest<HTMLElement>('[data-action-help]');
  if (root) openActionHelp(root);
});

document.addEventListener('focusout', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const root = target.closest<HTMLElement>('[data-action-help]');
  if (root && !root.contains(event.relatedTarget as Node | null))
    closeActionHelp(root);
});

function closeAllHelp(): void {
  closeOtherHelp();
  document
    .querySelectorAll<HTMLElement>('[data-action-help]')
    .forEach(closeActionHelp);
}

window.addEventListener('resize', closeAllHelp);
window.addEventListener('scroll', closeAllHelp, true);

const guide = document.querySelector<HTMLElement>('[data-guide-slug]');
if (guide) {
  const slug = guide.dataset.guideSlug;
  const category = guide.dataset.guideCategory as
    AnalyticsGuideCategory | undefined;
  if (
    slug &&
    isAnalyticsGuideSlug(slug) &&
    category &&
    ['start_here', 'workflow', 'reference'].includes(category)
  ) {
    emitAnalytics({
      name: 'guide_started',
      guide_slug: slug,
      guide_category: category,
    });
  }
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest<HTMLAnchorElement>('[data-guide-action]');
  if (!link) return;
  const slug =
    link.closest<HTMLElement>('[data-guide-slug]')?.dataset.guideSlug;
  if (!slug || !isAnalyticsGuideSlug(slug)) return;
  if (link.dataset.guideAction === 'next') {
    emitAnalytics({ name: 'guide_next_clicked', guide_slug: slug });
  } else if (link.dataset.guideAction === 'tool') {
    emitAnalytics({ name: 'guide_to_tool_clicked', guide_slug: slug });
  } else if (
    link.dataset.guideAction === 'complete' &&
    slug === 'getting-started'
  ) {
    emitAnalytics({
      name: 'quick_start_completed',
      guide_slug: 'getting-started',
    });
  }
});

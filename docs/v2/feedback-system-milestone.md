# V2 milestone: Feedback System

**Recorded:** 2026-09-30  
**Status:** Planned; implementation not started  
**Authority:** Owner-approved [V1.1 deferral](../decisions/v1.1-feedback-system-deferral.md)

## Purpose

Give users a clear way to send product feedback and report reproducible calculation
or content issues, with truthful expectations about review and follow-up.

## Current baseline

Owner amendment2026-10-08 authorizes a static email Feedback invitation at the
retained `/corrections/` route, using `contact@quiltclarity.com`, and a dedicated
Contact page. This update is verified locally; the live page remains
coming-soon until publication resumes. No site form or submission endpoint is
added. `/corrections/` remains `noindex` and excluded from the XML sitemap.
Reassess indexing when the capability ships. This milestone adds a future feedback capability; no launch date,
backend, provider, account requirement, or delivery channel has been selected.

## Required planning before implementation

- Define the submission types, minimum useful report details, and review workflow.
- Select a delivery/storage approach and a real operator responsible for monitoring it.
- Resolve privacy, consent, retention, abuse prevention, and any architecture or
  service permissions against the future V2 governing package.
- Define accessible validation, successful submission, failure, and unavailable states.

## Completion criteria

- A user can submit feedback through the selected working channel and receives
  an accurate acknowledgement; failures never imply successful delivery.
- The responsible operator can receive and review submissions.
- Users see what is collected and how it will be used; project data is never
  silently attached or included in analytics.
- Keyboard/mobile access and relevant privacy, delivery, and failure behavior
  are verified.
- The public page, navigation, help, and operational documentation describe the
  shipped capability consistently, replacing the coming-soon state only when ready.

The future V2 plan must assign ordering and detailed acceptance before development.
This milestone does not mark the broader V2 research or design package as approved.

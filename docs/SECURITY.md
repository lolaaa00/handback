# Security model

Handback is experimental Studionet software, not audited production escrow.

## Trust boundary

The intelligent contract is authoritative for terms, escrow, evidence versions, judgment, deadlines, and settlement. The browser is an untrusted transaction composer and reader. It never decides whether work passed and never holds funds.

## Contract protections

- Exact client and worker authorization for role-specific actions.
- Positive escrow and bounded acceptance, delivery, and cure windows.
- One to five uniquely identified acceptance criteria.
- HTTPS-only evidence with duplicate prevention and complete criterion coverage.
- Immutable, incrementing evidence versions and replay-resistant digests.
- Leader evaluation rerun by validators with stable-field equivalence checks.
- Separate `UNVERIFIABLE` evidence-repair state instead of treating network failure as failed work.
- Finalized-value transfers only after state is persisted.
- Terminal-state and version checks prevent repeated settlement.
- No owner, upgrade key, admin release, or unilateral post-acceptance cancellation.

## Known constraints

- Public URLs may change after submission unless a digest or immutable version is supplied.
- Validator web access and model behavior can be unavailable; the repair path handles this without deciding against either party.
- Studionet currency has no production-value guarantee.
- Public evidence and agreement terms should contain no secrets or personal information.

Report security issues privately to the repository owner. Do not include exploitable details in a public issue before a fix is available.

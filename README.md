# Handback

Handback is a Studionet-native milestone escrow for digital work. A client writes objective acceptance criteria and funds the commitment; a named worker accepts, publishes evidence, and requests an independent on-chain judgment. The contract—not the interface—owns the agreement, evidence versions, outcome, and settlement rights.

## Product flow

1. Connect an injected EIP-1193 wallet and switch to GenLayer Studionet (chain `61999`).
2. Create and fund a milestone with one to five measurable criteria.
3. The named worker accepts or declines the exact terms.
4. The worker maps public HTTPS evidence to every criterion.
5. GenLayer validators independently fetch that evidence and reach an equivalence-based judgment.
6. Satisfied work becomes payable; unmet work receives a bounded cure; unavailable evidence requests repair. Cure and repair resubmissions share a fixed two-correction limit, after which the final deadline leads to refund.
7. After funding finalizes, the interface recovers the on-chain commitment ID and opens its `/m/{id}` record. The tracked `/work` route reconstructs agreements for the connected wallet.

Handback deliberately provides no unilateral admin override, proxy upgrade, hidden signer, or private moderation service.

## Why GenLayer matters

Whether digital work materially satisfies a written requirement is not a formatting check: reasonable reviewers can disagree after reading the same public evidence. Handback makes that substantive judgment through GenLayer validators, which independently retrieve the bound sources and recompute the criterion-level result. A single Handback server cannot approve its preferred party or redirect escrow. Consensus changes the contract into payable, cure-required, or evidence-repair state; deterministic contract rules then control settlement.

## Live deployment

- Contract: [`0x10b52c8452861bdd4FeDA45f12f2e1A3D0400a79`](https://studio.genlayer.com/?import-contract=0x10b52c8452861bdd4FeDA45f12f2e1A3D0400a79)
- Deployment transaction: [`0xd9de…b35e`](https://genlayer-explorer.vercel.app/transactions/0xd9defa1850bcc23a9d7702a71c300adf77bdcadaef3acad58466e3a67546b35e)
- Frontend: `https://handback-milestones.vercel.app`

The production frontend is public and configured with the contract above.

## Run locally

Requirements: Node.js 24, Python 3.12+, and an injected wallet such as MetaMask or Rabby.

```bash
npm ci
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_HANDBACK_CONTRACT_ADDRESS` in `.env.local` after deploying the contract. Without it, the interface remains safely read-only and explains what is missing.

## Verify

```bash
npm run network:check
npm run typecheck
npm run lint
npm test
npm run contract:test
npm run contract:lint
npm run build
```

`npm run verify` runs the network guard, TypeScript, ESLint, frontend tests, Direct Mode contract tests, and production build. The contract tests use mocked web and LLM behavior inside GenLayer Direct mode. They cover party authorization, evidence completeness, consensus disagreement, bounded cure and repair outcomes through refund, duplicate/replay resistance, expiry, mutual cancellation, and single-use settlement. Frontend tests cover exact GEN conversion, collision-free criteria, and recovery of a newly funded agreement into its tracked record route.

## Architecture

- `contracts/handback.py` — the sole state and funds authority.
- `lib/contract.ts` — read/write client boundary.
- `components/WalletProvider.tsx` — injected-wallet discovery and strict Studionet switching.
- `components/useWrite.ts` — transaction submission, lifecycle monitoring, and recovery after reload.
- `components/MilestoneRoom.tsx` — role-aware actions derived from finalized contract state.
- `tests/direct/` and `frontend-tests/` — contract and interface test suites.

Studionet is the only configured network: chain `61999`, RPC `https://studio.genlayer.com/api`.

Core versions: Next.js `16.4.0`, React `19.1.1`, `genlayer-js` `1.1.8`, repository-local GenLayer CLI `0.39.1`, `genlayer-test` `0.29.2`, and `genvm-linter` `0.11.0`.

See [deployment](docs/DEPLOYMENT.md) and [security](docs/SECURITY.md) for operational details.
The exact on-chain verification record is in [live lifecycle evidence](docs/LIVE_EVIDENCE.md).

## Limitations

- Handback is experimental Studionet software and has not received an independent security audit.
- Agreement terms and evidence are public; users must not include secrets or private personal information.
- Validator web access and model availability can delay judgment. Unavailable or oversized evidence enters repair instead of moving funds.
- Public sources can change after submission unless the worker supplies an immutable version and matching response digest.

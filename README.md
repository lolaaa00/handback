# Handback

Handback is a Studionet-native milestone escrow for digital work. A client writes objective acceptance criteria and funds the commitment; a named worker accepts, publishes evidence, and requests an independent on-chain judgment. The contract—not the interface—owns the agreement, evidence versions, outcome, and settlement rights.

## Product flow

1. Connect an injected EIP-1193 wallet and switch to GenLayer Studionet (chain `61999`).
2. Create and fund a milestone with one to five measurable criteria.
3. The named worker accepts or declines the exact terms.
4. The worker maps public HTTPS evidence to every criterion.
5. GenLayer validators independently fetch that evidence and reach an equivalence-based judgment.
6. Satisfied work becomes payable; unmet work receives a bounded cure; unavailable evidence requests repair. Explicit expiry and mutual-cancellation paths return escrow safely.

Handback deliberately provides no unilateral admin override, proxy upgrade, hidden signer, or private moderation service.

## Live deployment

- Contract: [`0xC68752F7157C596C84E38620aaB5AE0f6dE0a76f`](https://genlayer-explorer.vercel.app/address/0xC68752F7157C596C84E38620aaB5AE0f6dE0a76f)
- Deployment transaction: [`0x0889…115f`](https://genlayer-explorer.vercel.app/transactions/0x0889d7eda4d33349ab3103919641dc9bbc1e258970837a1515682ce551a5115f)
- Frontend: `https://handback-milestones.vercel.app`

The Vercel project currently has account-level deployment protection enabled. The owner must disable Vercel Authentication before the frontend URL is public; the deployment itself is ready and configured with the contract above.

## Run locally

Requirements: Node.js 20+, Python 3.12+, and an injected wallet such as MetaMask.

```bash
npm ci
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

The contract tests use GenLayer Direct mode with mocked web and LLM behavior. They cover party authorization, evidence completeness, consensus disagreement, cure and repair outcomes, duplicate/replay resistance, expiry, mutual cancellation, and single-use settlement.

## Architecture

- `contracts/handback.py` — the sole state and funds authority.
- `lib/contract.ts` — read/write client boundary.
- `components/WalletProvider.tsx` — injected-wallet discovery and strict Studionet switching.
- `components/useWrite.ts` — transaction submission, lifecycle monitoring, and recovery after reload.
- `components/MilestoneRoom.tsx` — role-aware actions derived from finalized contract state.
- `tests/direct/` and `frontend-tests/` — contract and interface test suites.

Studionet is the only configured network: chain `61999`, RPC `https://studio.genlayer.com/api`.

See [deployment](docs/DEPLOYMENT.md) and [security](docs/SECURITY.md) for operational details.
The exact on-chain verification record is in [live lifecycle evidence](docs/LIVE_EVIDENCE.md).

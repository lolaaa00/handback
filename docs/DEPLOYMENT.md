# Deployment

## Contract

The project pins GenLayer CLI `0.39.1` as a development dependency. Deploy only from a clean, tested commit so the address can be traced to an exact source revision.

```bash
npm ci
npm run contract:test
npm run contract:lint
npx genlayer network set studionet
npx genlayer deploy contracts/handback.py
```

The CLI may require a locally configured funded Studionet account. Never place a private key in a tracked file. Record the resulting contract address, deployment transaction, network, timestamp, CLI version, and source commit in the release notes.

## Interface

Set this public build-time variable in the hosting environment:

```text
NEXT_PUBLIC_HANDBACK_CONTRACT_ADDRESS=0x...
```

Then deploy the Next.js application. The interface checks that the value is a 20-byte address and otherwise disables contract actions. No private environment variable or server-side API is required.

## Post-deployment checks

- Open the production URL with no wallet and confirm the read-only explanation.
- Connect an injected wallet and verify the app requests chain `61999`.
- Confirm reads and explorer links resolve on Studionet.
- Fund a minimal real commitment using two wallets.
- Exercise acceptance, evidence presentation, judgment, and settlement or refund.
- Confirm a reload resumes a pending transaction and that final UI state matches the contract read.

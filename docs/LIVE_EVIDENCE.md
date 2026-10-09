# Live Studionet evidence

All entries below are real finalized Studionet activity on chain `61999`, executed with repository-local GenLayer CLI `0.39.1`.

## Current deployment

- Handback: [`0x10b52c8452861bdd4FeDA45f12f2e1A3D0400a79`](https://genlayer-explorer.vercel.app/address/0x10b52c8452861bdd4FeDA45f12f2e1A3D0400a79)
- Deployment: [`0xd9defa1850bcc23a9d7702a71c300adf77bdcadaef3acad58466e3a67546b35e`](https://genlayer-explorer.vercel.app/transactions/0xd9defa1850bcc23a9d7702a71c300adf77bdcadaef3acad58466e3a67546b35e)
- Source commit: `2b2f970`
- Final result: `FINALIZED`, `MAJORITY_AGREE`, five validator votes agreeing
- Live configuration read: Studionet `61999`, maximum corrections `2`, maximum criteria `5`, maximum sources `5`

This deployment applies the fixed correction budget to both cure and evidence-repair resubmissions. Direct Mode verifies repeated unverifiable evidence reaches the correction limit and then the expiry refund path.

## Historical lifecycle deployment

- Handback: `0xC68752F7157C596C84E38620aaB5AE0f6dE0a76f`
- Deployment: [`0x0889d7eda4d33349ab3103919641dc9bbc1e258970837a1515682ce551a5115f`](https://genlayer-explorer.vercel.app/transactions/0x0889d7eda4d33349ab3103919641dc9bbc1e258970837a1515682ce551a5115f)
- Source commit: `cf738e2`
- Final result: `FINALIZED`, `MAJORITY_AGREE`

The representative lifecycle below was executed against this historical deployment before the bounded-repair update. It remains public evidence of the core judgment and settlement flow; production now points only to the current deployment above.

## Representative successful lifecycle — commitment #2

| Stage | Transaction | Verified result |
| --- | --- | --- |
| Fund 0.001 GEN | [`0xef6f…daee`](https://genlayer-explorer.vercel.app/transactions/0xef6f123f861b89a2db92dfe10cfe410bab7d6bbcaafbbe59f5fe2d2a2823daee) | `OFFERED`, finalized |
| Named worker accepts | [`0x32c5…d5a6`](https://genlayer-explorer.vercel.app/transactions/0x32c5a38aecd3449d741ce58029eb4cf77c4b5613fab5ca1ac639a7228bdbd5a6) | `ACTIVE` |
| Evidence v1 | [`0xba8f…3887`](https://genlayer-explorer.vercel.app/transactions/0xba8f052302b9d5684df96ee7a935c32dfb65d235a90823d47ab0b6bd890f3887) | Public official documentation bound to version 1 |
| Judgment v1 | [`0x3cf8…2eca`](https://genlayer-explorer.vercel.app/transactions/0x3cf83d31892dfe82057f20dbcd4494165697cb4070c810e26c85df5a285d2eca) | `INSUFFICIENT_EVIDENCE`; HTML exceeded the 64 KB evidence cap; `EVIDENCE_REPAIR` |
| Repaired evidence v2 | [`0xa43f…92f3`](https://genlayer-explorer.vercel.app/transactions/0xa43ffcb20df73823e8cd55d2bffcddd8543a458e3339cfe65dba48eeeae892f3) | Same official page’s 5 KB Markdown representation, finalized |
| Judgment v2 | [`0x34d1…1200`](https://genlayer-explorer.vercel.app/transactions/0x34d1212c1512c834e86aa1050ae97b89f97f3255d1f74f295aac6bdc8a881200) | `SATISFIED`, two rounds, `MAJORITY_AGREE`, `PAYABLE` |
| Settle | [`0x4a7a…5382`](https://genlayer-explorer.vercel.app/transactions/0x4a7ad38dd48e5b186d6f4af4b763713db223d46b51318802d7958b12adf95382) | `RELEASED`; 0.001 GEN recorded to the named worker |

The final contract read reported `state: RELEASED`, `judgment: SATISFIED`, `evidence_version: 2`, `judged_version: 2`, `settled_amount: 1000000000000000`, and the expected worker as `settled_to`.

## Alternate/failure behavior — commitment #1

The initial live offer used an acceptance deadline that had already passed by validator time. Worker acceptance transaction [`0xd4c9…f849`](https://genlayer-explorer.vercel.app/transactions/0xd4c9ec9691142224c62e993d99b585ab66f9f96b96acd1a95c6f5b3afe25f849) finalized with contract execution rolled back as `offer expired`; a subsequent contract read confirmed the state remained `OFFERED`. Refund transaction [`0x6fcb…0174`](https://genlayer-explorer.vercel.app/transactions/0x6fcb2833f60ef8838dbb45f6bd770a2a9b02240bcb1d87ef9e7b64d941410174) exercised the expiry recovery path and returned the 0.001 GEN escrow to the client.

This also verifies that transaction consensus/finality and contract execution success are distinct states: finalized transactions can contain a rolled-back contract execution, and the interface checks both.

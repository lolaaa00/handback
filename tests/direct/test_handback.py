import json
from datetime import datetime, timezone, timedelta


BASE = datetime(2026, 10, 8, 12, 0, tzinfo=timezone.utc)


def timestamp(delta):
    return int((BASE + delta).timestamp())


def criteria():
    return json.dumps([
        {"id": "live", "requirement": "The public product page loads and explains the service.", "proof": "A public HTTPS page."},
        {"id": "docs", "requirement": "A new user can follow the public setup guide.", "proof": "Versioned public documentation."},
    ])


def address(value):
    return "0x" + bytes(value).hex()


def sources():
    return json.dumps([
        {"criterion_id": "live", "url": "https://work.example/product", "kind": "WEB_PAGE", "version": "release-1", "sha256": ""},
        {"criterion_id": "docs", "url": "https://work.example/docs", "kind": "DOCUMENTATION", "version": "release-1", "sha256": ""},
    ])


def deploy(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.warp(BASE.isoformat())
    direct_vm.sender = direct_alice
    contract = direct_deploy("contracts/handback.py")
    direct_vm.value = 10**18
    commitment_id = contract.fund_commitment(
        address(direct_bob), "Public onboarding", "Build the agreed public onboarding and documentation.", criteria(),
        timestamp(timedelta(days=1)), timestamp(timedelta(days=5)), 86400,
    )
    direct_vm.value = 0
    return contract, commitment_id


def accept_and_submit(direct_vm, contract, commitment_id, worker):
    direct_vm.sender = worker
    contract.take_on(commitment_id)
    contract.present_work(commitment_id, sources())


def mock_available(direct_vm, llm_status="SATISFIED"):
    direct_vm.mock_web(r"work\.example", {"status": 200, "body": "<html><body>Public product and complete setup guide</body></html>"})
    direct_vm.mock_llm(r"funded digital-work milestone", json.dumps({"findings": [
        {"criterion_id": "live", "status": llm_status, "reason": "Observed the public delivery."},
        {"criterion_id": "docs", "status": "SATISFIED", "reason": "The guide is complete."},
    ]}))


def test_funded_offer_binds_terms_and_indexes_both_parties(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    item = contract.get_commitment(commitment_id)
    assert item["state"] == "OFFERED"
    assert item["escrow"] == 10**18
    assert len(item["criteria"]) == 2
    assert contract.commitments_for(address(direct_alice), 0, 10)[0]["id"] == commitment_id
    assert contract.commitments_for(address(direct_bob), 0, 10)[0]["id"] == commitment_id


def test_rejects_empty_escrow_self_dealing_and_bad_deadlines(direct_vm, direct_deploy, direct_alice, direct_bob):
    direct_vm.warp(BASE.isoformat()); direct_vm.sender = direct_alice
    contract = direct_deploy("contracts/handback.py")
    direct_vm.value = 0
    with direct_vm.expect_revert("escrow required"):
        contract.fund_commitment(address(direct_bob), "Title", "Brief", criteria(), timestamp(timedelta(days=1)), timestamp(timedelta(days=2)), 86400)
    direct_vm.value = 1
    with direct_vm.expect_revert("parties must differ"):
        contract.fund_commitment(address(direct_alice), "Title", "Brief", criteria(), timestamp(timedelta(days=1)), timestamp(timedelta(days=2)), 86400)
    with direct_vm.expect_revert("worker address invalid"):
        contract.fund_commitment("not-an-address", "Title", "Brief", criteria(), timestamp(timedelta(days=1)), timestamp(timedelta(days=2)), 86400)


def test_only_named_worker_can_accept_and_submit(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("worker only"):
        contract.take_on(commitment_id)
    direct_vm.sender = direct_bob
    contract.take_on(commitment_id)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("worker only"):
        contract.present_work(commitment_id, sources())


def test_evidence_requires_every_criterion_and_rejects_duplicates(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    direct_vm.sender = direct_bob; contract.take_on(commitment_id)
    incomplete = json.dumps([{"criterion_id": "live", "url": "https://work.example/product", "kind": "WEB_PAGE", "version": "r1", "sha256": ""}])
    with direct_vm.expect_revert("every criterion needs evidence"):
        contract.present_work(commitment_id, incomplete)
    contract.present_work(commitment_id, sources())
    assert contract.get_commitment(commitment_id)["state"] == "SUBMITTED"


def test_satisfied_consensus_creates_payable_right(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    accept_and_submit(direct_vm, contract, commitment_id, direct_bob)
    mock_available(direct_vm)
    assert contract.assess_work(commitment_id) == "SATISFIED"
    item = contract.get_commitment(commitment_id)
    assert item["state"] == "PAYABLE"
    assert item["judged_version"] == item["evidence_version"] == 1
    assert direct_vm.run_validator() is True


def test_substantive_validator_rejects_different_judgment(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    accept_and_submit(direct_vm, contract, commitment_id, direct_bob)
    mock_available(direct_vm)
    contract.assess_work(commitment_id)
    direct_vm.clear_mocks()
    mock_available(direct_vm, "NOT_SATISFIED")
    assert direct_vm.run_validator() is False


def test_negative_judgment_opens_bounded_cure(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    accept_and_submit(direct_vm, contract, commitment_id, direct_bob)
    mock_available(direct_vm, "NOT_SATISFIED")
    assert contract.assess_work(commitment_id) == "NOT_SATISFIED"
    item = contract.get_commitment(commitment_id)
    assert item["state"] == "CURE_REQUIRED"
    assert item["resubmit_by"] > timestamp(timedelta(0))


def test_unavailable_source_is_insufficient_not_failure(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    accept_and_submit(direct_vm, contract, commitment_id, direct_bob)
    direct_vm.mock_web(r"work\.example", {"status": 503, "body": "unavailable"})
    assert contract.assess_work(commitment_id) == "INSUFFICIENT_EVIDENCE"
    assert contract.get_commitment(commitment_id)["state"] == "EVIDENCE_REPAIR"


def test_duplicate_evidence_cannot_consume_a_new_version(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    accept_and_submit(direct_vm, contract, commitment_id, direct_bob)
    direct_vm.mock_web(r"work\.example", {"status": 503, "body": "unavailable"})
    contract.assess_work(commitment_id)
    with direct_vm.expect_revert("duplicate evidence"):
        contract.present_work(commitment_id, sources())


def test_mutual_cancellation_requires_both_distinct_parties(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    direct_vm.sender = direct_bob; contract.take_on(commitment_id)
    direct_vm.sender = direct_alice; contract.consent_to_cancel(commitment_id)
    assert contract.get_commitment(commitment_id)["state"] == "ACTIVE"
    with direct_vm.expect_revert("client already consented"):
        contract.consent_to_cancel(commitment_id)
    direct_vm.sender = direct_bob; contract.consent_to_cancel(commitment_id)
    assert contract.get_commitment(commitment_id)["state"] == "CANCELLED"


def test_offer_cannot_use_mutual_cancellation(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("cancellation unavailable"):
        contract.consent_to_cancel(commitment_id)


def test_expiry_is_not_callable_early(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    with direct_vm.expect_revert("refund unavailable"):
        contract.refund_expired(commitment_id)
    direct_vm.warp((BASE + timedelta(days=2)).isoformat())
    contract.refund_expired(commitment_id)
    assert contract.get_commitment(commitment_id)["state"] == "REFUNDED"


def test_settlement_is_single_use(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, commitment_id = deploy(direct_vm, direct_deploy, direct_alice, direct_bob)
    accept_and_submit(direct_vm, contract, commitment_id, direct_bob)
    mock_available(direct_vm); contract.assess_work(commitment_id)
    contract.settle_satisfied(commitment_id)
    assert contract.get_commitment(commitment_id)["state"] == "RELEASED"
    with direct_vm.expect_revert("release unavailable"):
        contract.settle_satisfied(commitment_id)

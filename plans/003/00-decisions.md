# Step 00 — Resolve implementation decisions

## Goal

Confirm the three product choices that directly determine validation and UI behavior. Do not begin code changes until these are recorded.

## Decisions required

1. **Category and payment method input**
   - Either allow new free-text values, subject to CSV-safe validation, or restrict both fields to values already in the ledger.
   - If restricted, determine how the UI obtains the allowed values from the current ledger.

2. **Amount/type consistency**
   - Decide whether `income` must have a positive amount and `expense` a negative amount, or whether a signed amount and type are independently valid.
   - The service must never silently rewrite either field.

3. **Reset success feedback**
   - Decide whether a post-reset success message is wanted. Confirmation before reset is mandatory regardless.

## Recorded decisions

1. **Category and payment method:** Allow free-text values. They must be
   non-empty and CSV-safe (no commas or line breaks).
2. **Amount/type consistency:** The signed amount and selected type are
   independently valid. The service persists both values exactly as supplied.
3. **Reset success feedback:** Do not show a separate success message; the
   refreshed authoritative ledger is the feedback after reset.

## Done when

- Each decision has a documented outcome.
- Validation and control choices for later steps are unambiguous.

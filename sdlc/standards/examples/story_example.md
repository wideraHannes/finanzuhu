# Example: a story that fulfils the Definition of Ready

This document is **not a real ticket**, but an illustrative example for the
[Definition of Ready](../definition_of_ready.md).

---

# ST-001: Reset password

**As a** registered user
**I want to** reset my password by email,
**so that** I regain access to my account when I have forgotten it.

## Acceptance criteria
- Entering a registered email address sends a mail with a reset link
- The link is valid for 60 minutes and can only be used once
- Entering an *unregistered* email address shows the same confirmation
  (no disclosure of whether an account exists)
- After a successful reset, all existing sessions are terminated

## Not part of this story
- Resetting via SMS
- Changing the password while the user is logged in

## Dependencies
- Mail delivery (ST-014) must be available

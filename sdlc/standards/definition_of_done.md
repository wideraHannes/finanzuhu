# Definition of Done

**What is this?** The checklist an implementation has to fulfil in order to count as **finished**. It is the yardstick reviews are run against — by humans and by the AI.

**Why is this especially important with AI?** An agent reports "done" as soon as the code runs. Whether it is readable, tested and in line with the architecture is something it only checks when given that as a criterion. The DoD is exactly that requirement in file form.

---

An implementation is done when:

- [ ] All **acceptance criteria** of the story are fulfilled
- [ ] **Tests** cover the new behavior — and have been *seen to fail*
- [ ] The entire **test suite is green**
- [ ] The code follows `architecture.md` and `code_style.md`
- [ ] **Readability:** meaningful names, no dead paths, no commented-out leftovers
- [ ] **Error handling** is designed deliberately, not just the "happy path"
- [ ] **Security:** no secrets in the code, inputs are validated
- [ ] **Documentation** is updated wherever the change would make it outdated
- [ ] A **review in a fresh session** has been run and the findings assessed

This file deliberately stays **under 200 lines**. It is read in every review session and therefore costs context every time.

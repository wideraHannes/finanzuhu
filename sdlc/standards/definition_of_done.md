# Definition of Done

An implementation is done when:

- [ ] All **acceptance criteria** of the story are fulfilled
- [ ] **Tests** cover the new behavior and have been _seen to fail_
- [ ] The entire **test suite is green**
- [ ] The code follows `architecture.md`
- [ ] **Readability:** meaningful names, no dead paths, no commented-out leftovers
- [ ] **Error handling** is designed deliberately, not just the "happy path"
- [ ] **Security:** no secrets in the code, inputs are validated
- [ ] **Documentation** is updated wherever the change would make it outdated
- [ ] A **review in a fresh session** has been run and the findings assessed

This file deliberately stays **under 200 lines**. It is read in every review session and therefore costs context every time.

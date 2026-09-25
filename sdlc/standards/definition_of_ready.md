# Definition of Ready

**What is this?** The team's checklist that defines what a story must contain **before** work on it starts. It protects against anyone — human or AI — starting to build without knowing what is actually supposed to be built.

**Why is this especially important with AI?** An agent does not ask back when something is unclear — it invents a plausible answer. A vague story leads to vague code that looks right at first glance.

---

A story is ready for implementation when:

- [ ] **Story sentence** present: "As a [role], I want to [action], so that [benefit]."
- [ ] **Acceptance criteria** are formulated concretely and testably
- [ ] **Scope** is delimited: what is explicitly *not* part of the story
- [ ] **Business context** is described, as far as needed for understanding
- [ ] **Dependencies** on other stories or systems are named
- [ ] The story is **small enough** to be implemented within one iteration

An applied example: [`examples/story_example.md`](examples/story_example.md)

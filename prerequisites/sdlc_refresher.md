# SDLC Workshop Refresher: AI Across the Software Development Lifecycle

## The big picture

The workshop uses the **DevOps loop** (Plan → Code → Build → Test → Release → Deploy → Operate → Monitor) to show that AI can help at every stage, not just when writing code. Each stage has an AI touchpoint: backlog and issue refinement in Plan, architecture and a code assistant in Code, pipelines in Build, test cases in Test, merge/pull requests and documentation in Release, an Ops-Copilot in Operate, and anomaly detection in Monitor.

The hands-on parts cover the path from **Plan to Release**. They share one idea: each step produces a Markdown file that feeds the next step. These files steer the AI and make its work repeatable, reviewable and shareable across the team.

**Mental model for working with a coding agent:** treat it like a senior developer who was woken up at 3 am and put in front of a project they have never seen, but who can read extremely fast. They are skilled but have no context. Your job is to give them the context they would need: what the goal is, how the system is built, what rules apply, and what "good" looks like.

---

## Part 1: Story Refinement (Plan)

**Why it matters:** An AI agent can only build well from a clear requirement. Vague stories lead to vague code.

**Key terms**

- **Backlog:** the prioritized list of work items (stories, bugs, tasks) for a product. _Backlog maintenance_ means keeping it tidy, current and prioritized.
- **User story:** a requirement written from the user's point of view: _"As a [role], I want to [action], so that [benefit]."_
- **Refinement:** turning a rough story into one the team can work on, with enough detail, clear scope and a shared understanding.
- **Acceptance criteria:** concrete, testable conditions that must be true for the story to count as fulfilled.
- **Definition of Ready (DoR):** the team's checklist of what a story must contain before work can start.

**How to use AI:** Use AI as a sparring partner for the product vision, backlog maintenance, writing stories and refining them. First, agree on a Definition of Ready together with the AI. Then use that file as the standard for refining every story.

> _"We need a 'definition of ready' for our project, so that each issue has a defined quality. It should include: story sentence ('as a … I want to … so that …'), business details if needed, acceptance criteria. What other aspects should be included in a story? Keep it brief and concise. Save the definition as docs/definition_of_ready.md"_

> _"Take a look at the following story: As a … I want to … so that … Refine this story according to @docs/definition_of_ready.md"_

**Exercise (≈45 min):** In plenum, build the DoR with the AI, save it as Markdown and share it with the team (10 min). Then look at the backlog and choose one or more stories that are neither too large nor too small, and not overloaded with detail (5 min). Refine them alone or in pairs until they meet the DoR (20 min). Finish with a joint review (10 min).

---

## Part 2: Planning & Implementation (Code)

**Why it matters:** Letting an agent "just code" gives you results that are hard to predict. Planning first keeps the AI targeted and under control.

**Key terms**

- **Spec-Driven Development:** a controlled workflow in three steps. _Plan_ means refining the story and writing a detailed implementation plan. _Execute_ means implementing the plan while following the project rules. _Review_ means checking the result against the plan and the rules, then writing a report. The cycle repeats as needed.
- **Implementation plan:** a document that states which parts of the application change, why they change, and which tests to write.
- **architecture.md / code_style.md:** steering documents that describe how the system is built and how code should look. The agent reads them in every step.
- **Sub-agents:** separate agent instances that handle individual tasks. They keep the main session's context (token usage) small and focused.

**How to use AI:** Let the AI explore the codebase and write the plan. Then let a _second pass_ review that plan critically. Framing it as someone else's work produces more honest criticism. After that, execute.

> **Plan:** _"Create an implementation plan for story `story_x_refined.md`. Explore the current implementation. What parts of the application must be changed and why? Which tests should be written? Follow `architecture.md` and `code_style.md`! Save the plan as `plan_x.md`"_

> **Plan review:** _"A senior developer has created a plan for `story_x_refined.md` in `plan_x.md`. Review this plan. What are its strengths and what are its weaknesses? What would you change and why? Write an updated version of the plan in `plan_x_v2.md`"_

> **Execute:** _"Work on `story_x_refined.md` according to the plan in `plan_x_v2.md`. If it makes sense, use sub agents for the individual tasks to reduce token usage on main session. Follow `architecture.md` and `code_style.md`!"_

**Exercise (≈30 min + sharing):** Take the refined story from Part 1. Create `architecture.md` if it does not exist yet. Write the plan, let the AI review it, and then check it manually (20 min). Let the AI execute the plan (10 min). Share results and experiences in plenum.

---

## Part 3: Review & Rework (Test / Release)

**Why it matters:** AI output has to be verified. Tests and structured reviews are how you verify it.

**Key terms**

- **Test-Driven Development (TDD):** write tests that define the expected behavior, then make them pass. With AI, tests show whether the output meets its goal and whether it breaks anything elsewhere. Two important rules: tests must _always_ be checked manually, and a test is only valuable if you have _seen it fail_. AI-written tests can contain subtle bugs, for example tests that always pass.
- **Definition of Done (DoD):** the checklist an implementation must meet before it counts as finished. It covers readability, maintainability, test coverage, compliance with architecture.md and code_style.md, and the acceptance criteria.
- **Separate session:** reviews and rework always run in a _fresh_ AI session. A session that wrote the code is biased toward its own decisions, just as a person is when reviewing their own work.

**How to use AI:** Build the DoD together with the AI. Then run a review in a new session that writes a report, and fix the findings one by one in yet another session.

> **DoD:** _"We need a 'definition of done' for our project, so that each implementation has a defined quality and follows the same rules. It should include readability, maintainability, test coverage, following `architecture.md` and `code_style.md`, acceptance criteria. What other aspects should be included in this definition? Save the definition as docs/definition_of_done.md"_

> **Review:** _"Review the current changes that were made for `story_x_refined.md` according to the plan in `plan_x_v2.md`. Is the implementation consistent, secure, maintainable, …? Does it follow the `architecture.md`, the `code_style.md` and the `definition_of_done.md`? Save the review as `review_x.md`"_

> **Rework:** _"Take a look at `review_x.md`. Check all detected bugs or places for rework. Work on these issues one by one. Follow `architecture.md` and `code_style.md`!"_

**Exercise (≈25 min + sharing):** Create the DoD with AI, let the AI review it, then check and improve it manually, keeping it under 200 lines (10 min). Run the loop: AI review, manual check of the findings, choose which findings are worth fixing, AI rework, AI review again. Repeat until satisfied (15 min). Share in plenum.

---

## Part 4: Documentation (Release)

**Why it matters:** Documentation is usually outdated. AI makes it cheap to create documentation and to keep it current.

**Key terms**

- **Arc42:** a widely used template for software architecture documentation. It has standard sections such as context, building blocks, runtime view, deployment and decisions.
- **README.md:** the entry point of a repository. It gives new developers an overview and tells them how to get started.
- **AGENTS.md / instruction files:** files that AI agents read automatically to learn about the project. Always _check and shorten these manually_, because everything in them uses up the agent's context in every session.
- **Mermaid / PlantUML:** text-based diagram languages. AI writes them very well, and they are versioned with the code. **ASCII art** is a simpler alternative.
- **AsciiDoc:** a text-based formatted-document format that can replace Word documents.
- **Rendering:** GitHub and GitLab display Mermaid directly. Confluence needs the diagrams rendered as images. VS Code has plugins for Mermaid, PlantUML and AsciiDoc that give you live previews.

**How to use AI:** Point the AI at the existing docs and code, and ask it to produce structured, text-based documentation with diagrams.

> _"I want to create architectural documentation for this application using the Arc42 template. Please check the existing documents in the @docs folder and also the @README.md file. Then examine the existing documentation in detail. For diagrams, use Mermaid or PlantUML"_

**Exercise:** Create a README for onboarding new developers, update AGENTS.md, produce an architecture diagram and write a full Arc42 documentation set. Present and discuss the results in plenum. Then improve the docs and check whether other documents, such as architecture.md, need updates. Finish with a closing review.

---

## Part 5: Conclusion

**The workflow for every story or ticket.** Each artifact builds on the ones before it:

1. **Refined story** ← product input + definition_of_ready
2. **Implementation plan** ← story + architecture + code_style + …
3. **Implementation** (iterative)
4. **Review** ← story + plan + architecture + tests + definition_of_done + … (loops back to implementation)
5. **Update documentation**, if needed

**Prompting dos and don'ts:** Don't give bare commands like _"create a definition of done."_ Also skip "please…" and "can you…", since they add nothing. Instead, invite a dialogue: _"Help us create a Definition of Done. What should it include? […] Ask one question at a time."_ This way the AI draws out your team's knowledge instead of producing generic boilerplate.

**What do I need to check?** "It depends." It depends mostly on how security-critical the project is. For critical infrastructure, ideally you check every line. Otherwise, the individual or team decides. Here is a rough priority order, from most to least important:

1. Steering documents (AGENTS.md, architecture.md, …). Errors here spread into everything else.
2. Story definitions, implementation plans and review reports
3. Tests
4. Key areas of the code (business logic)
5. Other code

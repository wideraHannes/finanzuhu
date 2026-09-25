# Release — documentation

Goal: documentation that does not go stale. With AI, creating and updating it is
cheap enough that there is no excuse left.

---

## Creating Arc42 documentation

```
I want to create architecture documentation for this application following the
Arc42 template.

First take a look at the existing documents in @docs/, the standards in
@sdlc/standards/ and the @README.md.

Use Mermaid or PlantUML for diagrams.

Save the result under docs/
```

## README for getting started

```
Create an overview that lets a new developer find their way into this project:
what the application does, how it is built, how to get it running locally.

For that, take a look at the code and @docs/.

Use it to update the README.md
```

## Architecture diagram

```
Create a Mermaid diagram of the software architecture.

Stick to what is actually in the code — not to what @docs/ claims.
```

## Updating the steering documents

```
The change for ST-XXX has been implemented.

Which documents are outdated because of it — architecture.md, code_style.md,
docs/?

Name them individually with the passage that no longer holds. Do not change
anything yet.
```

For `architecture.md` and `code_style.md`, **shorten manually** afterwards:
everything in them costs context in *every* session.

## Text-based formats

Everything that gets documented stays text-based and therefore versioned and
readable in the diff:

- **Markdown** for prose
- **Mermaid** or **PlantUML** for diagrams, **ASCII art** as a simple alternative
- **AsciiDoc** where formatted text is needed (replaces Word)

GitHub and GitLab render Mermaid directly; Confluence needs a rendered image.
For VS Code there are plugins with live previews for Mermaid, PlantUML and
AsciiDoc.

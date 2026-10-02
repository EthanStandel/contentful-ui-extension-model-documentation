Orientation for working in this repo. See [README.md](README.md) for the product pitch, the phased roadmap, and the project layout.

## Talking to the user

Default to the `caveman` skill for chat output in this repo. Invoke it at the
start of a session (or the moment you notice you've been writing prose
paragraphs) and stay in it — full level unless the user asks for another.

Prose explanations are the failure mode here, not the service. This file already
carries the reasoning; a turn does not need to restate it. Say what changed,
where, and what the user has to decide — nothing else. No preamble, no recap of
what was just read on screen, no summary of a summary.

Compression is for chat only. Code, comments, commit messages, and edits to this
file stay in ordinary English.

## How the app is wired together

[App.tsx](src/App.tsx) holds a `ComponentLocationSettings` map from `locations.LOCATION_*` to a component, and picks the first entry where `sdk.location.is(location)` is true. `LOCATION_ENTRY_EDITOR`, `LOCATION_PAGE`, and `LOCATION_HOME` are deliberately mapped to `null` — the app renders nothing there, and the scaffolded [EntryEditor](src/locations/EntryEditor/EntryEditor.tsx), [Page](src/locations/Page/Page.tsx), and [Home](src/locations/Home/Home.tsx) components are unreferenced leftovers from `create-contentful-app`. To add a location, add it to that map rather than branching anywhere else.

The four live locations:

- **[ConfigScreen](src/locations/ConfigScreen/ConfigScreen.tsx)** — the installation and management surface. Renders a button group for creating the documentation content type, and (once it exists) a table of every other content type in the space with per-row actions.
- **[Field](src/locations/Field/Field.tsx)** (`EntryReferenceField`) — a reference field editor for both single (`Link`) and multi (`Array`) reference fields. It renders Contentful's own `SingleEntryReferenceEditor` / `MultipleEntryReferenceEditor` from [`@contentful/field-editor-reference`](https://www.npmjs.com/package/@contentful/field-editor-reference) and replaces exactly two things through that package's seams: `renderCustomActions` supplies the [AddContentButton](src/locations/Field/components/AddContentButton/AddContentButton.tsx), which opens the picker dialog; `renderCustomCard` supplies the [DocumentedEntryCard](src/locations/Field/components/DocumentedEntryCard/DocumentedEntryCard.tsx). This is the core pitch: documentation is reachable at the exact moment an editor is choosing what to add.
- **[Dialog](src/locations/Dialog/Dialog.tsx)** — routes on `sdk.parameters.invocation`, read through [useInvocationData](src/hooks/useInvocationData.ts). A `"picker-dialog"` invocation renders the [ContentTypePicker](src/locations/Dialog/components/ContentTypePicker/ContentTypePicker.tsx), which calls the hook again with `"picker-dialog"` for its own parameters rather than being handed them (both calls parse the same stable `invocation` inside one `useMemo`); a `"documentation-dialog"` invocation renders that type's documentation; neither closes the dialog. Both modes are opened by other locations via `sdk.dialogs.openCurrent`.

  The picker is the field's whole add-control, deliberately replacing a menu rather than supplementing one: a menu is one column wide and gets clipped by the field's iframe, so documentation had to hide behind a hover. As a `fullWidth` dialog it shows the content type list beside the rendered documentation, with search. Because the dialog is its own iframe with its own SDK, it cannot call the reference editor's callbacks — it returns an intent through `sdk.close()` (`{ action: "create" | "link" | "authorDocumentation" }`) and the field executes it. That also means the dialog has its own SWR cache and refetches content types and documentation entries on open. Selection defaults to the first content type in the list and is derived from the filtered matches rather than stored outright, so searching re-points it at the first hit instead of leaving a selection the list no longer shows. Every action lives in one footer bar — the selected type's create/document buttons on the left, `Add existing content` on the right — because the detail pane scrolls, and buttons placed inside it float over the documentation instead of below it.

- **[Sidebar](src/locations/Sidebar/Sidebar.tsx)** — wraps the same `Documentation` component in a native `<details>` disclosure, keyed off `sdk.contentType.sys.id`, so the docs for the entry you're editing are one click away.

## Data model

The plugin stores documentation as ordinary Contentful entries of a single generated content type, rather than in app parameters or an external store. That keeps authoring inside the normal Contentful editing experience (including rich text and asset embeds) and means documentation is versioned, localized, and permissioned like any other content entry/type. Keep new documentation state in this content type rather than adding to installation parameters — parameters are for describing the model, not for holding content.

[createDocumentationType.ts](src/locations/ConfigScreen/components/CreateDocumentationTypeButtonGroup/utils/createDocumentationType.ts) creates and publishes the type via `sdk.cma.contentType.createWithId`. With default parameters it produces `internal__documentation` — `[INTERNAL] Documentation`:

| Field                   | ID              | Type       | Notes                                                                    |
| ----------------------- | --------------- | ---------- | ------------------------------------------------------------------------ |
| Contentful label        | `label`         | `Symbol`   | required; the display field                                              |
| Type ID (do not modify) | `typeId`        | `Symbol`   | required; `unique` validation — the content type ID this entry documents |
| Documentation           | `documentation` | `RichText` | the body that gets rendered                                              |

Lookup is a one-to-one join on `typeId`: [Documentation.tsx](src/components/Documentation/Documentation.tsx) queries `sdk.cma.entry.getPublished` filtered by `content_type` and `fields.typeId[match]`, takes the first hit, and renders `fields.documentation[documentationLocale]` through `documentToReactComponents`. Embedded assets are overridden by [EmbeddedAsset](src/components/EmbeddedAsset/EmbeddedAsset.tsx), which resolves the asset through the CMA and renders a responsive `<img>` linking to the full file. Hyperlinks whose whole text is `iframe` render as a full-width 16:9 `<iframe>` of the link's URL instead of an anchor — rich text has no embed node for arbitrary pages, so a link is how an author asks for one. While either query is loading it renders nothing; once settled with nothing a reader can see, it renders a "no documentation" note, so every surface that embeds it — Sidebar, Dialog, picker — shows the same empty state without checking for an entry itself.

Rendering reads published entries, not drafts, because the CMA otherwise hands back the working version and every editor in the space would read a half-written doc the moment it was saved — publish is the signal Contentful users already read as "other people can see this". Only when nothing is published does the component fall back to `entry.getMany` for the draft, and then it renders a note saying the documentation is unpublished rather than nothing, gated on `useCanAuthorDocumentation` so it reaches the people who can act on it. Without that note the author flow ends in silence: write the doc, save, come back, see nothing.

The join that answers _does an entry exist_ stays on drafts — [useFetchAllDocumentationEntries](src/hooks/useFetchAllDocumentationEntries.ts), [useDocumentationEntryLookup](src/hooks/useDocumentationEntryLookup.ts), and the config table's Create/Edit split. A saved-but-unpublished entry read as "not documented" would offer _Create documentation_ a second time and hit the `unique` validation on `typeId`. So the app asks two separate questions — does an entry exist (draft), and is there something a reader can see (published) — and they read from different endpoints on purpose.

Changing this shape means touching three places in step: the field definitions in `createDocumentationType.ts`, the schema and defaults in `AppInstallationParameters.ts`, and any reader that reaches into `fields` directly. Note that the type is only ever created, never migrated — a space that already ran the old version keeps the old content type, so field changes need a migration path, not just an edited definition.

## Installation parameters

[AppInstallationParameters](src/config/AppInstallationParameters.ts) is a zod schema plus a `getDefault()` factory, exposed as a namespace with a `Type` alias and an `isValid` type guard. It describes the documentation locale and the full shape of the documentation content type (its ID, label, and each field's ID and name), so the generated model is data rather than hardcoded — the intent being that a space with an ID conflict or a different locale can be accommodated without a code change. Read field IDs and the locale from parameters rather than writing literals; where the code currently doesn't, that's marked with a `// TODO -`.

[useAppParameters](src/hooks/useAppParameters.ts) is the single access point. It seeds state from the defaults, reads the real values from `sdk.app.getParameters()` (falling back to `sdk.parameters.installation`), validates them through `isValid` before adopting them, calls `sdk.app.setReady()`, and registers the `onConfigure` callback that persists parameters alongside the current target state when the user hits Install/Save.

Because `isValid` rejects the whole object on any mismatch and silently falls back to the defaults, adding a required field to the schema will invalidate every existing installation's stored parameters. Add new fields as optional, or with a default, unless you intend that reset.

## Hooks and data access

All CMA reads go through SWR so that the several components which independently ask for the same data share one request. Cache keys are arrays whose first element is a string naming the CMA call (e.g. `"sdk.cma.contentType.getMany"`), with the SDK and the relevant IDs as further members. Follow that convention for new reads — it's what keeps duplicate calls from separate component subtrees deduped.

- **[useIsInstalled](src/hooks/useIsInstalled.ts)** — `sdk.app.isInstalled()`; gates the create button so it can't run before the app has an installation to act under.
- **[useDocumentationTypeExists](src/hooks/useDocumentationTypeExists.ts)** — attempts `sdk.cma.contentType.get` on the configured ID and treats a throw as "doesn't exist". Returns `exists`, an `updating` flag, and an `update` (SWR `mutate`) so the config screen can re-check immediately after creating the type.
- **[useFetchAllContentType](src/hooks/useFetchAllContentType.ts)** — pages through `contentType.getMany`, filtering out the documentation type itself by default so it never offers to document its own model.
- **[useFetchAllDocumentationEntries](src/hooks/useFetchAllDocumentationEntries.ts)** — pages through the documentation entries so the config table can tell, per content type, whether documentation already exists.
- **[useAppParameters](src/hooks/useAppParameters.ts)** — the single access point for installation parameters. Never read `sdk.parameters.installation` directly; go through this hook so the zod validation and defaults apply.
- **[useInvocationData](src/hooks/useInvocationData.ts)** — the single access point for invocation parameters. `openCurrent` types its `parameters` only as `SerializedJSONValue`, so the receiving iframe gets `unknown` in practice. `InvocationData` is the `z.infer` of `InvocationValidators` and describes both ends of the hop: a `{ type, data }` discriminated union that an opener passes as `satisfies InvocationData` and a reader narrows on `type`. One type rather than two, since without a transform the input and output sides are identical. The union is what keeps the wire format from expressing two variants at once or none, and `Dialog` routes by narrowing it. The variants carry the surface in their own names (`"picker-dialog"`, `"documentation-dialog"`) rather than the hook carrying it, so an invocation that is not a dialog still reads through this same hook. The hook returns `InvocationData | null` via `safeParse`, so an absent or malformed invocation is `null` rather than a throw inside render. A caller that only handles one variant passes its `type` (`useInvocationData("picker-dialog")`) and gets that variant, `Extract`ed from the union, or `null` if the invocation is anything else — so it asks its own question instead of narrowing; a router like `Dialog` calls it with no argument and narrows the whole union. Adding a variant means adding it to the union and handling it where callers narrow.
- **[useStableResponse](src/hooks/useStableResponse.ts)** — a small utility that `Object.assign`s each render's values onto a single `useRef` object and returns that same object. Every hook above returns through it, so the returned object is referentially stable and can be used in dependency arrays without retriggering effects. New hooks should do the same.

- **[useDocumentationEntryLookup](src/hooks/useDocumentationEntryLookup.ts)** — indexes the documentation entries by the content type they document, so the field's menu and every card can ask "is this documented?" without a query each.
- **[useCanAuthorDocumentation](src/hooks/useCanAuthorDocumentation.ts)** — `sdk.access.can` against the documentation type; the field hides its authoring shortcut rather than disabling it, mirroring how the reference editor hides create actions a user lacks permission for. The action checked follows what the button will actually do: `create` on the content type when no documentation entry exists, `update` on that entry's own id when one does — passing the real id so entry-scoped role rules evaluate against the entry rather than a synthetic one. `publish` is deliberately not checked: `Documentation` reads through the CMA, which returns the draft, so documentation renders as soon as it is saved and a user who can only save still authors usefully.

Auto-resizing is a location concern, not a content one: [useAutoResizer](src/hooks/useAutoResizer.ts) calls `sdk.window.startAutoResizer()` on mount and is invoked only by the two surfaces whose height should follow their content — Field and Sidebar. `Documentation` does not call it, so it can be embedded anywhere without dictating iframe height. Both Dialog modes are fixed-height shells that scroll internally (`height: 100vh` plus `overflow-y: auto`), sized by the `minHeight` passed to `openCurrent`, so neither needs the resizer; that keeps the two modes consistent and keeps long documentation from growing the dialog past the viewport.

`openCurrent` has no `height` or `maxHeight` — only `minHeight` (`number | string`) and `allowHeightOverflow`. Because the Dialog never starts the resizer, the iframe sits at exactly `minHeight` and never grows, so `minHeight` is in practice the dialog's height. Both modes pass `calc(100vh - 170px)`: the string is a CSS value resolved in the web app's document, so `vh` there is the real browser viewport. The inset has to clear two pieces of Forma36 `Modal` chrome, because the iframe is clipped rather than shrunk if it exceeds them — and what gets clipped is the bottom of the content, which on the picker is the footer's padding under the CTA row. The modal root caps at `calc(100vh - 1rem * (100 / fontBaseDefault))`, i.e. `100vh - 100px`; its header adds `spacingM` above and below plus a border, about 53px. That puts the real ceiling near `100vh - 153px`, and 170px leaves slack for a taller header. `allowHeightOverflow` stays off (its default) — all it does is set `maxHeight: none` on that root, which for a shell that already scrolls internally just lets the modal overflow the viewport on a short screen. Tune the inset in both call sites together.

[useCreateDocumentationEntry](src/hooks/useCreateDocumentationEntry.ts) is the single way a documentation entry gets seeded (label + `typeId`), shared by the config screen's table and the field's menu. It reads the SDK and parameters through `useAppParameters` itself, so callers pass only the `ContentTypeProps` being documented. After creating it revalidates the shared documentation-entries SWR cache and, by default, opens the new entry (`opts.openAfterCreate` — the field's menu passes `false` because it opens the entry itself in a slide-in).

## Configuration flow

1. Deploy the bundle and install the app into a space; the config screen mounts and `useAppParameters` marks it ready.
2. **Create documentation content type** — disabled (with an explanatory tooltip) until the app is actually installed, and again once the type exists. On click it creates and publishes the type, then revalidates the existence check.
3. Once the type exists, a **View documentation content type** link appears — a plain `<a target="_top">` to the space's content-type URL, which resolves correctly only when the app is served from the Contentful origin (noted inline in the source as not working locally).
4. The [ContentTypeDocumentationInstallationTable](src/locations/ConfigScreen/components/ContentTypeDocumentationInstallationTable/ContentTypeDocumentationInstallationTable.tsx) lists every content type with a per-row menu. _Create documentation_ creates an entry pre-populated with a `[INTERNAL] "<name>" documentation` label and the content type's ID, refetches, then navigates the user straight into the new entry to write the body. _View/Edit documentation_ opens the existing entry. Each item is disabled based on whether documentation already exists, so the two are mutually exclusive.

## Design stance

These are the tie-breakers this repo reaches for when a design could go either way. They exist because the opposite instinct — adding explicit structure to make a shape safe — reads as tidier in the moment and costs more to maintain.

- **One declaration per fact.** When two things must be kept in sync, collapse them rather than documenting the pairing. A type that mirrors a value is derived from it, not written twice: `InvocationData` is the `z.infer` of `InvocationValidators`, and `AppInstallationParameters.Type` of its validator. If a library primitive already expresses the shape, use it before hand-rolling a mapped type or a parallel registry.
- **Colocate until there is a second consumer.** A schema, helper, or type with one importer lives in the file that imports it — the invocation validators sit in [useInvocationData](src/hooks/useInvocationData.ts), not in a module of their own. Split it out when something else actually needs it, and let that second need dictate where it lands.
- **Data already in context is not a prop.** The SDK, installation parameters, and invocation parameters all arrive through hooks, so a component that needs them calls the hook — [ContentTypePicker](src/locations/Dialog/components/ContentTypePicker/ContentTypePicker.tsx) reads its own invocation data rather than being handed it by `Dialog`, which parses the same payload for routing. Repeated hook calls over one memoized value are cheaper than a seam through every caller and test harness.
- **Prefer a local awkwardness to a structural change.** An early return that must sit below the hook calls is three lines in one file; the prop that avoids it is a signature, a barrel export, and a test harness. Before routing around an awkwardness, check whether the constraint causing it is load-bearing at all — it often is not.
- **Shape returns so callers ask their own question.** What a caller reads and what a writer must produce are different questions. A writer should not be able to express an impossible state, so the invocation wire format is a discriminated union rather than a bag of independently-optional keys. A reader should not have to hand-roll a narrowing helper, but narrowing a union on its own discriminator is one line and needs no machinery — reach for a shape that removes the narrowing only when it costs less than it hides.

## Conventions

- User-facing strings live in [translate.ts](src/config/translate.ts) as a plain nested object passed to `createTranslate`, and are rendered at the point of use with `translate("<area>.<name>")` — plus a values object for messages carrying `{placeholders}`. [createTranslate](src/config/i18n.ts) is a thin wrapper over `i18n.t` that exists for type safety: it takes the catalog through a `const` type parameter (so the object needs no `as const`), constrains the key to the catalog's actual dotted paths, and infers placeholder names from the message at that path. An unknown key, a branch node, or a missing/misspelled value is a compile error. Message IDs are generated, so the English text _is_ the ID: an empty catalogue renders it as written (`activateI18n` registers `compileMessage` explicitly, because Lingui only installs its runtime compiler outside production — without it a production build prints `{placeholders}` raw), and adding a locale means loading a catalogue in `activateI18n` rather than touching call sites. Two things stay out: the content type ID, label, and field names in `AppInstallationParameters` (persisted join keys, not chrome), and `LocalhostWarning` (dev-only, with links inside its sentences).
- Components live in a folder named after them with a barrel `index.ts` re-exporting from the implementation file.
- A module that groups related non-component exports wraps them in an `export namespace` named after the file (`AppInstallationParameters`, `TestFixtures`, `TestSdk`, `MockField`). Never destructure a namespace; reference members through it at the point of use (`TestFixtures.contentTypes`, not `const { contentTypes } = TestFixtures`), so what a value is stays readable where it is used.
- A barrel file always re-exports with `export *`, never a named list. If something in the implementation file should not be visible outside the directory, move it to a separate adjacent file that the barrel does not re-export, rather than narrowing the barrel.
- Styling is `@emotion/css` v11's `css`/`cx` string API, applied via `className`; layout comes from Forma36 `Flex`/`Stack`.
- Colors and spacing come from `@contentful/f36-tokens` (`import tokens from "@contentful/f36-tokens"`), never literals: `tokens.gray300` rather than `#cfd9e0`, `tokens.spacingM` rather than `16` or `"1rem"`. Forma36's own spacing props take the token name as a string (`gap="spacingM"`). It keeps this app's surfaces on the same scale as the Forma36 components and the reference editor drawn beside them. Values with no token behind them — `1px` borders, percentages, viewport units, and one-off pixel sizes that match something else on screen (`minHeight: 89`, `width: 320`, the `calc(100vh - 170px)` dialog inset) — stay literal, with a comment where the number is derived from something.
- Forma36 is v6, matching the version `@contentful/field-editor-reference` renders with. Keep them on the same major: two copies means the components this app owns drift visually from the ones the package draws.
- [DocumentedEntryCard](src/locations/Field/components/DocumentedEntryCard/DocumentedEntryCard.tsx) is a deliberate fork of the package's `WrappedEntryCard`, which exposes no way to add a menu item. Diff it against upstream when upgrading the package.
- `@lingui/core` must have an active locale before the reference editor renders, which [activateI18n](src/config/i18n.ts) does at bootstrap. Vite `resolve.dedupe` keeps it to one instance. Lingui's `LOCALE` governs the app's own chrome and is a different axis from `documentationLocale` in the installation parameters, which selects the Contentful locale documentation entries are read from.
- `messages.documentation.entryLabel` is the one message that becomes stored content rather than chrome: it is written onto a new documentation entry in `documentationLocale`, so an entry keeps the wording it was created with.
- [getLinkableContentTypeIds](src/locations/Field/utils/getLinkableContentTypeIds.ts) exists because `renderCustomActions` only hands over the _creatable_ content types (the package filters by `access.can('create', ...)`). Documentation must stay reachable for a type a user can link but not create, so the linkable set is re-derived from the field's own validations — field-level plus, for arrays, item-level. `undefined` means no restriction, so every content type in the space is linkable.
- The ported card drops one thing upstream has: `WrappedEntryCard` renders a badge showing per-locale publish state, and that component is not exported, so [DocumentedEntryCard](src/locations/Field/components/DocumentedEntryCard/DocumentedEntryCard.tsx) shows plain entity status instead. Only differs for spaces using localized publishing.
- Imports reach outside their own directory through the `~` alias, which points at `src` (`~/hooks/useAppParameters`, not `../../hooks/useAppParameters`). Same-directory `./` imports stay relative. The alias is declared in two places that must agree: `paths` in [tsconfig.json](tsconfig.json) and `resolve.alias` in [vite.config.ts](vite.config.ts).
- `npm run lint` enforces that with a local `alias-parent-imports` rule in [eslint.config.mjs](eslint.config.mjs), and `npm run lint:fix` (or fix-on-save, configured in [.vscode/settings.json](.vscode/settings.json)) rewrites offenders automatically. The rule is local rather than a dependency because `eslint-plugin-no-relative-import-paths` calls `context.getCwd()`, removed in ESLint 10. Prettier cannot do any of this — it only formats.
- `unused-imports/no-unused-imports` removes dead imports on the same fix pass. It is TypeScript-aware: it trims partially-unused named imports and leaves imports used only in type positions alone.
- Prettier is configured with defaults ([.prettierrc.json](.prettierrc.json)); format before committing.
- Code carries almost no comments. Prefer names and structure that make the intent readable; when something genuinely needs explaining — a workaround, a deliberate deviation, a constraint imposed from outside — it belongs in this file, not in a block above the code. `// TODO -` markers on known rough edges are the exception that stays inline.

## Tests

`npm test` runs Vitest in browser mode (Playwright/Chromium) over screenshot
states. A spec sits beside the component it covers, and its baselines sit beside
the spec:

```
components/AddContentMenu/
  AddContentMenu.tsx
  AddContentMenu.spec.tsx        # empty-menu-open, submenu-undocumented
  __screenshots__/*.png
components/DocumentedEntryCard/
  DocumentedEntryCard.tsx
  DocumentedEntryCard.spec.tsx   # populated, broken-link
  __screenshots__/*.png
```

Baseline placement follows the _spec file's_ directory, via the
`resolveScreenshotPath` hook under `test.browser.expect` in
[vite.config.ts](vite.config.ts) — note that option lives under `browser`,
not `test.expect`, where it is silently ignored. So a screenshot lands next to a
component only if the test asserting it lives there too; splitting states across
specs is what distributes the images.

The fake SDK exposes `cma` (a plain client built over the fake adapter) as well as
the `cmaAdapter` the package reads, since this app's hooks go through the former;
and it stubs `navigator.onSlideInNavigation`, which the reference editor
subscribes to on mount and the fake navigator has no notion of.

Both specs render the whole field rather than mounting a component directly,
because the menu and the card only exist inside the reference editor. States come
from fake SDKs (`@contentful/field-editor-test-utils`) over one fixture space in
[TestFixtures](src/test/TestFixtures.ts), so cases that are awkward to
reach in a real space — a read-only role, a deleted entry — are just options on
[MockField.render](src/test/MockField.tsx). The picker's
[MockPicker.render](src/test/MockPicker.tsx) builds a dialog SDK over the same
fixtures, and [MockDocumentation.render](src/test/MockDocumentation.tsx) mounts
`Documentation` alone over a single entry. Its embedded-page spec loads the real
`https://example.com/`, so it needs network access. It waits on that URL's
resource-timing entry rather than looking inside the frame, because
`expect.element` cannot reach into a cross-origin frame. Specs and their baselines sit beside components; the harnesses they
share — fixtures, render helpers, and the `TestSdk` holder the `useSDK` mock reads —
live together in [src/test](src/test), since they span locations.

Baselines are OS-specific (`-chromium-darwin`); they were generated on macOS, so
a Linux CI run will need its own committed alongside.

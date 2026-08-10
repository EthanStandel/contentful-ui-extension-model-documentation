Orientation for working in this repo. See [README.md](README.md) for the product pitch, the phased roadmap, and the project layout.

## How the app is wired together

[App.tsx](src/App.tsx) holds a `ComponentLocationSettings` map from `locations.LOCATION_*` to a component, and picks the first entry where `sdk.location.is(location)` is true. `LOCATION_ENTRY_EDITOR`, `LOCATION_PAGE`, and `LOCATION_HOME` are deliberately mapped to `null` — the app renders nothing there, and the scaffolded [EntryEditor](src/locations/EntryEditor/EntryEditor.tsx), [Page](src/locations/Page/Page.tsx), and [Home](src/locations/Home/Home.tsx) components are unreferenced leftovers from `create-contentful-app`. To add a location, add it to that map rather than branching anywhere else.

The four live locations:

- **[ConfigScreen](src/locations/ConfigScreen/ConfigScreen.tsx)** — the installation and management surface. Renders a button group for creating the documentation content type, and (once it exists) a table of every other content type in the space with per-row actions.
- **[Field](src/locations/Field/Field.tsx)** (`EntryReferenceListField`) — a replacement editor for a multi-reference field. It renders each linked entry as a Forma36 `EntryCard` and replaces Contentful's "Add content" control with a menu whose per-content-type submenus offer both _Create new entry_ and _View documentation_. This is the core pitch: documentation is reachable at the exact moment an editor is choosing what to add.
- **[Dialog](src/locations/Dialog/Dialog.tsx)** — receives a `contentTypeId` through `sdk.parameters.invocation` and renders the documentation for it; closes itself if the parameter is missing. Opened by the Field location via `sdk.dialogs.openCurrent`.
- **[Sidebar](src/locations/Sidebar/Sidebar.tsx)** — wraps the same `Documentation` component in a native `<details>` disclosure, keyed off `sdk.contentType.sys.id`, so the docs for the entry you're editing are one click away.

## Data model

The plugin stores documentation as ordinary Contentful entries of a single generated content type, rather than in app parameters or an external store. That keeps authoring inside the normal Contentful editing experience (including rich text and asset embeds) and means documentation is versioned, localized, and permissioned like any other content entry/type. Keep new documentation state in this content type rather than adding to installation parameters — parameters are for describing the model, not for holding content.

[createDocumentationType.ts](src/locations/ConfigScreen/components/CreateDocumentationTypeButtonGroup/utils/createDocumentationType.ts) creates and publishes the type via `sdk.cma.contentType.createWithId`. With default parameters it produces `internal__documentation` — `[INTERNAL] Documentation`:

| Field                   | ID              | Type       | Notes                                                                    |
| ----------------------- | --------------- | ---------- | ------------------------------------------------------------------------ |
| Contentful label        | `label`         | `Symbol`   | required; the display field                                              |
| Type ID (do not modify) | `typeId`        | `Symbol`   | required; `unique` validation — the content type ID this entry documents |
| Documentation           | `documentation` | `RichText` | the body that gets rendered                                              |

Lookup is a one-to-one join on `typeId`: [Documentation.tsx](src/components/Documentation/Documentation.tsx) queries `sdk.cma.entry.getMany` filtered by `content_type` and `fields.typeId[match]`, takes the first hit, and renders `fields.documentation[documentationLocale]` through `documentToReactComponents`. Embedded assets are overridden by [EmbeddedAsset](src/components/EmbeddedAsset/EmbeddedAsset.tsx), which resolves the asset through the CMA and renders a responsive `<img>` linking to the full file. If no documentation entry exists, the component renders nothing at all — the Sidebar and Dialog degrade silently rather than showing an empty state.

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
- **[useStableResponse](src/hooks/useStableResponse.ts)** — a small utility that `Object.assign`s each render's values onto a single `useRef` object and returns that same object. Every hook above returns through it, so the returned object is referentially stable and can be used in dependency arrays without retriggering effects. New hooks should do the same.

[Field.tsx](src/locations/Field/Field.tsx) sits outside this pattern: it uses `useState`/`useEffect` with a module-level `Map` (`contentTypeCache`) to memoize content-type fetches across all card instances.

Both the Field and Documentation components call `sdk.window.startAutoResizer()` on mount so the iframe grows to fit its content. Any new location that renders variable-height content needs the same.

## Configuration flow

1. Deploy the bundle and install the app into a space; the config screen mounts and `useAppParameters` marks it ready.
2. **Create documentation content type** — disabled (with an explanatory tooltip) until the app is actually installed, and again once the type exists. On click it creates and publishes the type, then revalidates the existence check.
3. Once the type exists, a **View documentation content type** link appears — a plain `<a target="_top">` to the space's content-type URL, which resolves correctly only when the app is served from the Contentful origin (noted inline in the source as not working locally).
4. The [ContentTypeDocumentationInstallationTable](src/locations/ConfigScreen/components/ContentTypeDocumentationInstallationTable/ContentTypeDocumentationInstallationTable.tsx) lists every content type with a per-row menu. _Create documentation_ creates an entry pre-populated with a `[INTERNAL] "<name>" documentation` label and the content type's ID, refetches, then navigates the user straight into the new entry to write the body. _View/Edit documentation_ opens the existing entry. Each item is disabled based on whether documentation already exists, so the two are mutually exclusive.

## Conventions

- User-facing strings live in a `CONSTANTS` object at the bottom of the component file, not inline in JSX.
- Components live in a folder named after them with a barrel `index.ts` re-exporting from the implementation file.
- Styling is `emotion` v10's `css`/`cx` string API, applied via `className`; layout comes from Forma36 `Flex`/`Stack`.
- Prettier is configured with defaults ([.prettierrc.json](.prettierrc.json)); format before committing.
- Known rough edges are marked with `// TODO -` comments at the relevant code.

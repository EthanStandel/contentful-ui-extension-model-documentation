# Contentful Model Documentation

A Contentful app that attaches human-written documentation to a space's content
types, and surfaces it where editors are making decisions — choosing what to add
to a reference field, or working inside an entry.

## Language

### Documentation

**Documentation content type**:
The single generated content type that holds all documentation for a space. One
per space, created by the app rather than authored by hand.
_Avoid_: documentation model, doc type, internal type

**Documentation entry**:
An entry of the documentation content type. Each one describes exactly one
content type, and carries the rich-text body an editor reads.
_Avoid_: doc, docs entry, documentation record

**Documented content type**:
A content type that has a documentation entry. Its opposite, an undocumented
content type, is a normal and expected state rather than an error.
_Avoid_: has-docs, covered type

**Documentation locale**:
The locale whose values are read when rendering a documentation entry. Distinct
from the space's default locale, which governs the entries an editor is editing.
_Avoid_: default locale, docs language

### Reference fields

**Reference field**:
A field that links to other entries, whether it holds a single link or a list of
them. The app replaces Contentful's own editor for these.
_Avoid_: entry list field, entry selector, relationship field

**Linkable content type**:
A content type this reference field is allowed to hold, per the field's
validations. A field with no such validation can link any content type in the
space.
_Avoid_: allowed content type, available content type

**Creatable content type**:
A linkable content type the current user also has permission to create entries
of. Always a subset of the linkable ones, and the distinction matters: a user may
need to read a content type's documentation while being unable to create it.
_Avoid_: permitted content type, writable type

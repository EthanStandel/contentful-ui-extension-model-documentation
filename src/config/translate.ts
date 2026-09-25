import { createTranslate } from "./i18n";

export const translate = createTranslate({
  configScreen: {
    heading: "Contentful Model Documentation UI Extension",
    subheading:
      "This plugin creates one content type to represent the documentation for all other content types.",
    documentModels:
      "Create or view documentation for the content-types listed below",

    createDocumentationTypeButtonGroup: {
      createLabel: "Create documentation content type",
      createTooltipUninstalled:
        "The content type cannot be generated until this extension is installed to your space.",
      createTooltipExists: "This content type already exists",
      viewLabel: "View documentation content type",
    },

    contentTypeDocumentationInstallationTable: {
      name: "Name",
      id: "ID",
      actions: "Actions",
      createDocumentation: "Create documentation",
      viewEditDocumentation: "View/Edit documentation",
      openMenu: "Open menu",
    },
  },

  field: {
    addContentMenu: {
      addContent: "Add content",
      addExisting: "Add existing content",
      newContent: "New content",
      createNewEntry: "Create new entry",
      viewDocumentation: "View documentation",
      createDocumentation: "Create documentation",
      editDocumentation: "Edit documentation",
      undocumented: 'No documentation yet for "{name}"',
    },

    documentedEntryCard: {
      untitled: "Untitled",
      edit: "Edit",
      remove: "Remove",
      moveToTop: "Move to top",
      moveToBottom: "Move to bottom",
      viewDocumentation: "View documentation",
    },
  },

  picker: {
    search: "Search content types",
    documented: "Documented",
    undocumented: "Not documented",
    createNewEntry: "Create new entry",
    addExisting: "Add existing content",
    createDocumentation: "Create documentation",
    editDocumentation: "Edit documentation",
    noMatches: "No content types match your search",
    fieldFull: "This field has reached its maximum number of entries",
  },

  sidebar: {
    summary: "Documentation",
  },

  documentation: {
    dialogTitle: "{contentTypeName} documentation",
    none: "No documentation has been written for this content type yet.",
    unpublished:
      "This documentation has not been published yet, so other editors cannot see it.",
    entryLabel: '[INTERNAL] "{contentTypeName}" documentation',
  },
});

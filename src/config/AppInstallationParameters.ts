import z from "zod";

export namespace AppInstallationParameters {
  export const validator = z.object({
    documentationLocale: z.string(),
    documentationModel: z.object({
      contentTypeId: z.string(),
      label: z.string(),
      fields: z.object({
        label: z.object({
          id: z.string(),
          name: z.string(),
        }),
        type: z.object({
          id: z.string(),
          name: z.string(),
        }),
        documentation: z.object({
          id: z.string(),
          name: z.string(),
        }),
      }),
    }),
    labels: z.object({
      global: z.object({
        documentation: z.string(),
      }),
      configScreen: z.object({
        heading: z.string(),
        subheading: z.array(z.string()),
        cta: z.object({
          createDocumentationContentType: z.object({
            label: z.string(),
            tooltip: z.object({
              uninstalled: z.string(),
              exists: z.string(),
            }),
          }),
          viewDocumentationContentType: z.object({
            label: z.string(),
          }),
          createDocumentation: z.object({
            label: z.string(),
          }),
          viewDocumentation: z.object({
            label: z.string(),
          }),
        }),
        documentModels: z.string(),
      }),
    }),
  });

  export const isValid = (input: unknown): input is Type =>
    validator.safeParse(input).success;

  export type Type = z.infer<typeof validator>;

  export const getDefault = (): Type => ({
    documentationLocale: "en-US",
    documentationModel: {
      contentTypeId: "internal__documentation",
      label: "[INTERNAL] Documentation",
      fields: {
        label: {
          id: "label",
          name: "Contentful label",
        },
        type: {
          id: "typeId",
          name: "Type ID",
        },
        documentation: {
          id: "documentation",
          name: "Documentation",
        },
      },
    },
    labels: {
      global: {
        documentation: "Documentation",
      },
      configScreen: {
        heading: "Contentful Model Documentation UI Extension",
        subheading: [
          "This plugin creates one content type to represent the documentation for all other content types.",
        ],
        cta: {
          createDocumentationContentType: {
            label: "Create documentation content type",
            tooltip: {
              uninstalled:
                "The content type cannot be generated until this extension is installed to your space.",
              exists: "This content type already exists",
            },
          },
          viewDocumentationContentType: {
            label: "View documentation content type",
          },
          createDocumentation: {
            label: "Create documentation",
          },
          viewDocumentation: {
            label: "View documentation",
          },
        },
        documentModels:
          "Create or view documentation for the content-types listed below",
      },
    },
  });
}

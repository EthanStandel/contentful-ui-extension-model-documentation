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
          name: "Type ID (do not modify)",
        },
        documentation: {
          id: "documentation",
          name: "Documentation",
        },
      },
    },
  });
}

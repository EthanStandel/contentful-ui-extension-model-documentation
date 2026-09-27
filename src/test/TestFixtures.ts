import type { ContentTypeProps, EntryProps } from "contentful-management";

export namespace TestFixtures {
  export const LOCALE = "en-US";

  export const contentTypes = {
    primaryHero: buildContentType("primaryHero", "Primary Hero"),
    homepageHero: buildContentType("homepageHero", "Homepage Hero"),
    fiftyFiftyHero: buildContentType("fiftyFiftyHero", "FiftyFifty Hero"),
  } satisfies Record<string, ContentTypeProps>;

  export const documentationContentType = buildContentType(
    "internal__documentation",
    "[INTERNAL] Documentation",
  );

  const richText = (text: string) => ({
    nodeType: "document",
    data: {},
    content: [
      {
        nodeType: "paragraph",
        data: {},
        content: [{ nodeType: "text", value: text, marks: [], data: {} }],
      },
    ],
  });

  export const documentationEntries = [
    buildEntry(
      "doc-primary-hero",
      "internal__documentation",
      {
        label: '[INTERNAL] "Primary Hero" documentation',
        typeId: "primaryHero",
      },
      {
        documentation: richText(
          "The Primary Hero is the large banner at the top of a landing page. Use one per page, above all other modules.",
        ),
      },
    ),
  ];

  export const embeddedPageDocumentationEntry = buildEntry(
    "doc-fifty-fifty-hero",
    "internal__documentation",
    {
      label: '[INTERNAL] "FiftyFifty Hero" documentation',
      typeId: "fiftyFiftyHero",
    },
    {
      documentation: {
        nodeType: "document",
        data: {},
        content: [
          {
            nodeType: "paragraph",
            data: {},
            content: [
              {
                nodeType: "text",
                value: "Iframe content example",
                marks: [],
                data: {},
              },
            ],
          },
          {
            nodeType: "paragraph",
            data: {},
            content: [
              { nodeType: "text", value: "", marks: [], data: {} },
              {
                nodeType: "hyperlink",
                data: { uri: "https://example.com/" },
                content: [
                  { nodeType: "text", value: "iframe", marks: [], data: {} },
                ],
              },
              { nodeType: "text", value: "", marks: [], data: {} },
            ],
          },
        ],
      },
    },
  );

  export const entries = [
    buildEntry("entry-primary-hero", "primaryHero", {
      title: "Spring campaign hero",
    }),
    buildEntry("entry-homepage-hero", "homepageHero", {
      title: "Homepage banner",
    }),
  ];

  function buildContentType(id: string, name: string): ContentTypeProps {
    return {
      sys: { id, type: "ContentType" },
      name,
      displayField: "title",
      fields: [
        {
          id: "title",
          name: "Title",
          type: "Symbol",
          required: true,
          localized: false,
        },
      ],
    } as unknown as ContentTypeProps;
  }

  function buildEntry(
    id: string,
    contentTypeId: string,
    fields: Record<string, string>,
    richFields: Record<string, unknown> = {},
  ): EntryProps {
    return {
      sys: {
        id,
        type: "Entry",
        version: 1,
        publishedVersion: 1,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        contentType: { sys: { id: contentTypeId, type: "Link" } },
        space: { sys: { id: "space", type: "Link" } },
        environment: { sys: { id: "master", type: "Link" } },
      },
      fields: {
        ...Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [
            key,
            { [LOCALE]: value },
          ]),
        ),
        ...Object.fromEntries(
          Object.entries(richFields).map(([key, value]) => [
            key,
            { [LOCALE]: value },
          ]),
        ),
      },
    } as unknown as EntryProps;
  }
}

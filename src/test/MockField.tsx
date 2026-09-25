import { SWRConfig } from "swr";
import {
  createFakeCMAAdapter,
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeNavigatorAPI,
  createFakeSpaceAPI,
} from "@contentful/field-editor-test-utils";
import type { FieldAppSDK } from "@contentful/app-sdk";
import { createClient } from "contentful-management";
import { EntryReferenceField } from "~/locations/Field/Field";
import { TestSdk } from "./TestSdk";
import { activateI18n } from "~/config/i18n";

import { TestFixtures } from "./TestFixtures";

activateI18n();

export namespace MockField {
  type Options = {
    linkedEntryIds?: string[];
    linkableContentTypeIds?: string[];
    creatableContentTypeIds?: string[];
    includeBrokenLink?: boolean;
    canAuthorDocumentation?: boolean;
    fieldType?: "Array" | "Link";
  };

  export const render = ({
    linkedEntryIds = [],
    linkableContentTypeIds = [
      TestFixtures.contentTypes.primaryHero.sys.id,
      TestFixtures.contentTypes.homepageHero.sys.id,
      TestFixtures.contentTypes.fiftyFiftyHero.sys.id,
    ],
    creatableContentTypeIds,
    includeBrokenLink = false,
    canAuthorDocumentation = true,
    fieldType = "Array",
  }: Options = {}) => {
    const creatable = creatableContentTypeIds ?? linkableContentTypeIds;

    const links = [
      ...linkedEntryIds,
      ...(includeBrokenLink ? ["missing-entry"] : []),
    ].map((id) => ({ sys: { id, type: "Link", linkType: "Entry" } }));

    const [field] = createFakeFieldAPI(
      (fieldApi) =>
        ({
          ...fieldApi,
          type: fieldType,
          locale: TestFixtures.LOCALE,
          validations: fieldType === "Link" ? linkContentTypeValidation() : [],
          items:
            fieldType === "Array"
              ? {
                  type: "Link",
                  linkType: "Entry",
                  validations: linkContentTypeValidation(),
                }
              : undefined,
        }) as any,
      fieldType === "Array" ? links : links[0],
    );

    function linkContentTypeValidation() {
      return linkableContentTypeIds
        ? [{ linkContentType: linkableContentTypeIds }]
        : [];
    }

    const allContentTypes = [
      ...Object.values(TestFixtures.contentTypes),
      TestFixtures.documentationContentType,
    ];

    const cma = createFakeCMAAdapter({
      ContentType: {
        getMany: async () => ({
          items: allContentTypes,
          total: allContentTypes.length,
          skip: 0,
          limit: 100,
        }),
        get: async ({ contentTypeId }: any) =>
          allContentTypes.find((ct) => ct.sys.id === contentTypeId) as any,
      },
      Entry: {
        getMany: async ({ query }: any) =>
          query?.content_type === TestFixtures.documentationContentType.sys.id
            ? {
                items: TestFixtures.documentationEntries,
                total: TestFixtures.documentationEntries.length,
                skip: 0,
                limit: 100,
              }
            : {
                items: TestFixtures.entries,
                total: TestFixtures.entries.length,
                skip: 0,
                limit: 100,
              },
        get: async ({ entryId }: any) => {
          const entry = TestFixtures.entries.find((e) => e.sys.id === entryId);
          if (!entry) throw new Error("Entry not found");
          return entry as any;
        },
      },
    });

    const cmaClient = createClient(
      { apiAdapter: cma },
      {
        type: "plain",
        defaults: { spaceId: "space", environmentId: "master" },
      },
    );

    const sdk = {
      field,
      cma: cmaClient,
      locales: createFakeLocalesAPI(),
      space: createFakeSpaceAPI(),
      navigator: {
        ...createFakeNavigatorAPI(),
        onSlideInNavigation: () => () => {},
        openNewEntry: async () => ({ navigated: false }),
      },
      cmaAdapter: cma,
      ids: { space: "space", environment: "master" },
      hostnames: { webapp: "app.contentful.com" },
      window: { startAutoResizer: () => {}, updateHeight: () => {} },
      parameters: { installation: {}, instance: {}, invocation: {} },
      dialogs: { openCurrent: async () => undefined },
      access: {
        can: async (_action: string, entity: any) => {
          const contentTypeId = entity?.sys?.contentType?.sys?.id ?? "";
          return contentTypeId === TestFixtures.documentationContentType.sys.id
            ? canAuthorDocumentation
            : creatable.includes(contentTypeId);
        },
      },
      app: undefined,
    } as unknown as FieldAppSDK;

    TestSdk.set(sdk);

    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        <EntryReferenceField />
      </SWRConfig>
    );
  };
}

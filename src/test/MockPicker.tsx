import { SWRConfig } from "swr";
import { createFakeCMAAdapter } from "@contentful/field-editor-test-utils";
import type { DialogAppSDK } from "@contentful/app-sdk";
import { createClient } from "contentful-management";
import { ContentTypePicker } from "~/locations/Dialog/components/ContentTypePicker";
import type { InvocationData } from "~/hooks/useInvocationData";
import { TestSdk } from "./TestSdk";
import { activateI18n } from "~/config/i18n";
import { TestFixtures } from "./TestFixtures";

activateI18n();

export namespace MockPicker {
  type Options = {
    linkableContentTypeIds?: string[] | null;
    creatableContentTypeIds?: string[];
    canLinkEntity?: boolean;
    canAuthorDocumentation?: boolean;
    publishedDocumentation?: boolean;
    isFull?: boolean;
    onClose?: (result: unknown) => void;
  };

  export const render = ({
    linkableContentTypeIds = [
      TestFixtures.contentTypes.primaryHero.sys.id,
      TestFixtures.contentTypes.homepageHero.sys.id,
      TestFixtures.contentTypes.fiftyFiftyHero.sys.id,
    ],
    creatableContentTypeIds,
    canLinkEntity = true,
    canAuthorDocumentation = true,
    publishedDocumentation = true,
    isFull = false,
    onClose = () => {},
  }: Options = {}) => {
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
      },
      Entry: {
        getMany: async ({ query }: any) =>
          collection(documentingType(TestFixtures.documentationEntries, query)),
        getPublished: async ({ query }: any) =>
          collection(
            publishedDocumentation
              ? documentingType(TestFixtures.documentationEntries, query)
              : [],
          ),
      },
    });

    const sdk = {
      cma: createClient(
        { apiAdapter: cma },
        {
          type: "plain",
          defaults: { spaceId: "space", environmentId: "master" },
        },
      ),
      cmaAdapter: cma,
      ids: { space: "space", environment: "master" },
      hostnames: { webapp: "app.contentful.com" },
      window: { startAutoResizer: () => {}, updateHeight: () => {} },
      close: onClose,
      parameters: {
        installation: {},
        instance: {},
        invocation: {
          type: "picker-dialog",
          data: {
            linkableContentTypeIds,
            creatableContentTypeIds:
              creatableContentTypeIds ?? linkableContentTypeIds ?? [],
            canLinkEntity,
            isFull,
          },
        } satisfies InvocationData,
      },
      access: {
        can: async (_action: string, entity: any) =>
          entity?.sys?.contentType?.sys?.id ===
          TestFixtures.documentationContentType.sys.id
            ? canAuthorDocumentation
            : true,
      },
      app: undefined,
    } as unknown as DialogAppSDK;

    TestSdk.set(sdk);

    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        <ContentTypePicker />
      </SWRConfig>
    );
  };

  const documentingType = <T extends { fields: any }>(
    entries: T[],
    query: Record<string, unknown> | undefined,
  ) => {
    const typeId = query?.["fields.typeId"];
    return typeId === undefined
      ? entries
      : entries.filter((entry) => entry.fields.typeId?.["en-US"] === typeId);
  };

  const collection = <T,>(items: T[]) => ({
    items,
    total: items.length,
    skip: 0,
    limit: 100,
  });
}

import { SWRConfig } from "swr";
import { createFakeCMAAdapter } from "@contentful/field-editor-test-utils";
import type { SidebarAppSDK } from "@contentful/app-sdk";
import { createClient, type EntryProps } from "contentful-management";
import { Documentation } from "~/components/Documentation";
import { TestSdk } from "./TestSdk";
import { activateI18n } from "~/config/i18n";
import { TestFixtures } from "./TestFixtures";

activateI18n();

export namespace MockDocumentation {
  type Options = {
    entry: EntryProps;
  };

  export const render = ({ entry }: Options) => {
    const collection = {
      items: [entry],
      total: 1,
      skip: 0,
      limit: 100,
    };

    const cma = createFakeCMAAdapter({
      Entry: {
        getMany: async () => collection,
        getPublished: async () => collection,
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
      parameters: { installation: {}, instance: {}, invocation: undefined },
      access: { can: async () => true },
      app: undefined,
    } as unknown as SidebarAppSDK;

    TestSdk.set(sdk);

    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        <Documentation
          contentTypeId={entry.fields.typeId[TestFixtures.LOCALE]}
        />
      </SWRConfig>
    );
  };
}

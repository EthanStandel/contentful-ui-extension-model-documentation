import { useSDK } from "@contentful/react-apps-toolkit";
import useSWR from "swr";
import { useStableResponse } from "./useStableResponse";
import { useAppParameters } from "./useAppParameters";
import { KnownAppSDK } from "@contentful/app-sdk";
import { ContentTypeProps, EntryProps } from "contentful-management";

const PAGE_SIZE = 10;

export const useFetchAllDocumentationEntries = () => {
  const sdk = useSDK();
  const { parameters } = useAppParameters();

  const { data: documentationEntries, mutate: refetchDocumentationEntries } =
    useSWR(
      [
        "useFetchAllDocumentationEntries",
        sdk,
        parameters.documentationModel.contentTypeId,
      ],
      async ([_id, sdk, contentTypeId]: [string, KnownAppSDK, string]) => {
        try {
          const collection = Array<Array<EntryProps>>();

          const fetchDocumentationEntries = async (skip = 0) => {
            const response = await sdk.cma.entry.getMany({
              query: { include: PAGE_SIZE, skip, content_type: contentTypeId },
            });

            collection.push(response.items);

            if (response.total > skip + PAGE_SIZE) {
              await fetchDocumentationEntries(skip + PAGE_SIZE);
            }
          };

          await fetchDocumentationEntries();
          return collection.flat();
        } catch {
          return [];
        }
      },
    );

  return useStableResponse({
    documentationEntries: documentationEntries ?? [],
    refetchDocumentationEntries,
  });
};

import { useSDK } from "@contentful/react-apps-toolkit";
import useSWR from "swr";
import { useStableResponse } from "./useStableResponse";
import { useAppParameters } from "./useAppParameters";
import { KnownAppSDK } from "@contentful/app-sdk";
import { ContentTypeProps } from "contentful-management";

const PAGE_SIZE = 10;

export const useFetchAllContentType = ({
  filterDocumentationType = true,
}: {
  filterDocumentationType?: boolean;
} = {}) => {
  const sdk = useSDK();
  const { parameters } = useAppParameters();

  const { data: contentTypes, mutate: refetch } = useSWR(
    [
      "sdk.cma.contentType.getMany",
      sdk,
      filterDocumentationType,
      parameters.documentationModel.contentTypeId,
    ],
    async ([, sdk, filterDocumentationType, contentTypeId]) => {
      try {
        const collection = Array<Array<ContentTypeProps>>();

        const fetchContentTypes = async (skip = 0) => {
          const response = await sdk.cma.contentType.getMany({
            query: { include: PAGE_SIZE, skip },
          });
          const items = response.items;
          if (filterDocumentationType) {
            collection.push(items.filter((ct) => ct.sys.id !== contentTypeId));
          } else collection.push(items);

          if (response.total > skip + PAGE_SIZE) {
            fetchContentTypes(skip + PAGE_SIZE);
          }
        };

        await fetchContentTypes();
        return collection.flat();
      } catch {
        return [];
      }
    },
  );

  return useStableResponse({ contentTypes: contentTypes ?? [], refetch });
};

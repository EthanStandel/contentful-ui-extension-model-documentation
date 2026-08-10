import { useSDK } from "@contentful/react-apps-toolkit";
import useSWR from "swr";
import { useStableResponse } from "./useStableResponse";
import { useAppParameters } from "./useAppParameters";
import { fetchAllPages } from "./utils/fetchAllPages";

export const useFetchAllDocumentationEntries = () => {
  const sdk = useSDK();
  const { parameters } = useAppParameters();

  const { data: documentationEntries, mutate: refetchDocumentationEntries } =
    useSWR(
      [
        "sdk.cma.entry.getMany",
        sdk,
        parameters.documentationModel.contentTypeId,
      ],
      async ([, sdk, documentationContentTypeId]) => {
        try {
          return await fetchAllPages((pagination) =>
            sdk.cma.entry.getMany({
              query: {
                ...pagination,
                content_type: documentationContentTypeId,
              },
            }),
          );
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

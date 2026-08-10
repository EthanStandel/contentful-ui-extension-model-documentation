import { useSDK } from "@contentful/react-apps-toolkit";
import useSWR from "swr";
import { useStableResponse } from "./useStableResponse";
import { useAppParameters } from "./useAppParameters";
import { fetchAllPages } from "./utils/fetchAllPages";

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
        const contentTypes = await fetchAllPages((pagination) =>
          sdk.cma.contentType.getMany({ query: pagination }),
        );

        return filterDocumentationType
          ? contentTypes.filter((ct) => ct.sys.id !== contentTypeId)
          : contentTypes;
      } catch {
        return [];
      }
    },
  );

  return useStableResponse({ contentTypes: contentTypes ?? [], refetch });
};

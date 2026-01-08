import useSWR from "swr";
import { useAppParameters } from "./useAppParameters";
import { useRef } from "react";
import { useIsInstalled } from "./useIsInstalled";
import { useStableResponse } from "./useStableResponse";

export const useDocumentationTypeExists = () => {
  const isInstalled = useIsInstalled();
  const { sdk, parameters } = useAppParameters();

  const {
    data: existsResponse,
    isValidating,
    mutate: update,
  } = useSWR(
    [
      "useDocumentationTypeExists",
      isInstalled,
      sdk.ids.space,
      sdk.ids.environment,
      parameters.documentationModel.contentTypeId,
    ],
    async ([_id, isInstalled, spaceId, environmentId, contentTypeId]: [
      string,
      boolean,
      string,
      string,
      string,
    ]) => {
      try {
        if (!isInstalled) return false;
        const response = await sdk.cma.contentType.get({
          spaceId,
          environmentId,
          contentTypeId,
        });
        return !!response?.sys?.id;
      } catch {
        return false;
      }
    },
  );

  return useStableResponse({
    exists: isValidating ? null : existsResponse,
    updating: isValidating,
    update,
  });
};

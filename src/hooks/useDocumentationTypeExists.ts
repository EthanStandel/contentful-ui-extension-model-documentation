import useSWR from "swr";
import { useAppParameters } from "./useAppParameters";
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
      "sdk.cma.contentType.get",
      sdk,
      isInstalled,
      sdk.ids.space,
      sdk.ids.environment,
      parameters.documentationModel.contentTypeId,
    ],
    async ([, sdk, isInstalled, spaceId, environmentId, contentTypeId]) => {
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

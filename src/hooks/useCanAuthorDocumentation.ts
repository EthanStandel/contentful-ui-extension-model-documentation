import useSWR from "swr";
import { useAppParameters } from "./useAppParameters";

export const useCanAuthorDocumentation = (
  documentationEntryId?: string | null,
) => {
  const { sdk, parameters } = useAppParameters();

  const { data: canAuthorDocumentation } = useSWR(
    [
      "sdk.access.can",
      sdk,
      parameters.documentationModel.contentTypeId,
      documentationEntryId ?? null,
    ],
    async ([, sdk, contentTypeId, entryId]) => {
      try {
        return await sdk.access.can(entryId ? "update" : "create", {
          sys: {
            ...(entryId ? { id: entryId } : {}),
            type: "Entry",
            contentType: { sys: { id: contentTypeId, type: "Link" } },
          },
        });
      } catch {
        return false;
      }
    },
  );

  return canAuthorDocumentation ?? false;
};

import { useMemo } from "react";
import { useAppParameters } from "./useAppParameters";
import { useFetchAllDocumentationEntries } from "./useFetchAllDocumentationEntries";
import { useStableResponse } from "./useStableResponse";

export const useDocumentationEntryLookup = () => {
  const { parameters } = useAppParameters();
  const { documentationEntries, refetchDocumentationEntries } =
    useFetchAllDocumentationEntries();

  const documentationEntryIdsByTypeId = useMemo(() => {
    const entries = new Map<string, string>();

    for (const entry of documentationEntries) {
      const typeId =
        entry.fields[parameters.documentationModel.fields.type.id]?.[
          parameters.documentationLocale
        ];

      if (typeof typeId === "string") entries.set(typeId, entry.sys.id);
    }

    return entries;
  }, [
    documentationEntries,
    parameters.documentationModel.fields.type.id,
    parameters.documentationLocale,
  ]);

  return useStableResponse({
    getDocumentationEntryId: (contentTypeId: string) =>
      documentationEntryIdsByTypeId.get(contentTypeId),
    refetchDocumentationEntries,
  });
};

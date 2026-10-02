import { useAppParameters } from "./useAppParameters";
import { useCreateDocumentationEntry } from "./useCreateDocumentationEntry";
import { useDocumentationEntryLookup } from "./useDocumentationEntryLookup";
import { useFetchAllContentType } from "./useFetchAllContentType";
import { useStableResponse } from "./useStableResponse";

/**
 * Returns `createOrEditDocumentation(contentTypeId)`, which opens that content
 * type's documentation entry for editing, creating it first if needed.
 */
export const useCreateOrEditDocumentation = () => {
  const { sdk } = useAppParameters();
  const contentTypeList = useFetchAllContentType();
  const createDocumentationEntry = useCreateDocumentationEntry();
  const documentationEntryLookup = useDocumentationEntryLookup();

  const createOrEditDocumentation = async (contentTypeId: string) => {
    const contentType = contentTypeList.contentTypes.find(
      (candidate) => candidate.sys.id === contentTypeId,
    );
    if (!contentType) return;

    const entryId =
      documentationEntryLookup.getDocumentationEntryId(contentTypeId) ??
      (await createDocumentationEntry(contentType, { openAfterCreate: false }))
        .sys.id;

    await sdk.navigator.openEntry(entryId, { slideIn: { waitForClose: true } });
    await documentationEntryLookup.refetchDocumentationEntries();
  };

  return useStableResponse({ createOrEditDocumentation });
};

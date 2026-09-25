import type { ContentTypeProps, EntryProps } from "contentful-management";
import { useAppParameters } from "./useAppParameters";
import { useFetchAllDocumentationEntries } from "./useFetchAllDocumentationEntries";
import { translate } from "~/config/translate";

export const useCreateDocumentationEntry = () => {
  const { sdk, parameters } = useAppParameters();
  const { refetchDocumentationEntries } = useFetchAllDocumentationEntries();

  return async (
    contentType: ContentTypeProps,
    opts: { openAfterCreate: boolean } = { openAfterCreate: true },
  ): Promise<EntryProps> => {
    const { documentationModel, documentationLocale } = parameters;

    const entry = await sdk.cma.entry.create(
      {
        spaceId: sdk.ids.space,
        environmentId: sdk.ids.environment,
        contentTypeId: documentationModel.contentTypeId,
      },
      {
        fields: {
          [documentationModel.fields.label.id]: {
            [documentationLocale]: translate("documentation.entryLabel", {
              contentTypeName: contentType.name,
            }),
          },
          [documentationModel.fields.type.id]: {
            [documentationLocale]: contentType.sys.id,
          },
        },
      },
    );

    await refetchDocumentationEntries();

    if (opts.openAfterCreate) {
      await sdk.navigator.openEntry(entry.sys.id);
    }

    return entry;
  };
};

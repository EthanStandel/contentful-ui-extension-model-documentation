import { useMemo, type ComponentProps } from "react";
import type { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { RichTextEditor } from "@contentful/field-editor-rich-text";
import type {
  ContentType,
  WrappedEntryCard,
} from "@contentful/field-editor-reference";
import { useCreateOrEditDocumentation } from "~/hooks/useCreateOrEditDocumentation";
import { useFetchAllContentType } from "~/hooks/useFetchAllContentType";
import { DocumentedEntryCard } from "~/locations/Field/components/DocumentedEntryCard";
import { ViewDocumentationMenuItem } from "~/locations/Field/components/ViewDocumentationMenuItem";
import { openContentTypePicker } from "~/locations/Field/utils/openContentTypePicker";

const documentedEntryCards = {
  Block: (props: ComponentProps<typeof WrappedEntryCard>) => (
    <DocumentedEntryCard
      {...props}
      entity={props.entry}
      size={props.size === "small" ? "small" : "default"}
    />
  ),
  inlineActions: (contentType?: ContentType) =>
    contentType
      ? [
          <ViewDocumentationMenuItem
            key="documentation"
            contentType={contentType}
          />,
        ]
      : [],
};

export const DocumentedRichTextEditor = () => {
  const sdk = useSDK<FieldAppSDK>();
  const contentTypeList = useFetchAllContentType();
  const documentationEditing = useCreateOrEditDocumentation();

  const documentedSdk = useMemo(() => {
    const selectSingleEntry: FieldAppSDK["dialogs"]["selectSingleEntry"] =
      async (options) => {
        const linkableContentTypeIds = options?.contentTypes?.length
          ? options.contentTypes
          : contentTypeList.contentTypes.map(
              (contentType) => contentType.sys.id,
            );

        const result = await openContentTypePicker(sdk, {
          linkableContentTypeIds,
          creatableContentTypeIds: await filterCreatable(
            linkableContentTypeIds,
          ),
          canLinkEntity: true,
          isFull: false,
        });

        if (result?.action === "link")
          return sdk.dialogs.selectSingleEntry(options);
        if (result?.action === "create") {
          const { entity } = await sdk.navigator.openNewEntry(
            result.contentTypeId,
            { slideIn: true },
          );
          return entity as never;
        }
        if (result?.action === "authorDocumentation")
          await documentationEditing.createOrEditDocumentation(
            result.contentTypeId,
          );
        return null;
      };

    const filterCreatable = async (contentTypeIds: string[]) => {
      const permitted = await Promise.all(
        contentTypeIds.map((id) =>
          sdk.access
            .can("create", {
              sys: {
                type: "Entry",
                contentType: { sys: { id, type: "Link" } },
              },
            })
            .catch(() => false),
        ),
      );
      return contentTypeIds.filter((_, index) => permitted[index]);
    };

    return {
      ...sdk,
      dialogs: { ...sdk.dialogs, selectSingleEntry },
      documentedEntryCards,
    };
  }, [sdk, contentTypeList, documentationEditing]);

  return <RichTextEditor sdk={documentedSdk} isInitiallyDisabled={false} />;
};

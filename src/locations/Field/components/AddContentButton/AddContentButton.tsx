import { Button } from "@contentful/f36-components";
import { PlusIcon } from "@contentful/f36-icons";
import type { FieldAppSDK } from "@contentful/app-sdk";
import type { CustomActionProps } from "@contentful/field-editor-reference";
import { useSDK } from "@contentful/react-apps-toolkit";
import { css } from "@emotion/css";
import tokens from "@contentful/f36-tokens";
import { useCreateDocumentationEntry } from "~/hooks/useCreateDocumentationEntry";
import { useDocumentationEntryLookup } from "~/hooks/useDocumentationEntryLookup";
import { useFetchAllContentType } from "~/hooks/useFetchAllContentType";
import type { InvocationData } from "~/hooks/useInvocationData";
import { getLinkableContentTypeIds } from "~/locations/Field/utils/getLinkableContentTypeIds";
import type { ContentTypePicker } from "~/locations/Dialog/components/ContentTypePicker";
import { translate } from "~/config/translate";

export const AddContentButton = ({
  contentTypes: creatableContentTypes,
  onCreate,
  onLinkExisting,
  isDisabled,
  isFull,
  canLinkEntity,
}: CustomActionProps) => {
  const sdk = useSDK<FieldAppSDK>();
  const { contentTypes } = useFetchAllContentType();
  const createDocumentationEntry = useCreateDocumentationEntry();
  const { getDocumentationEntryId, refetchDocumentationEntries } =
    useDocumentationEntryLookup();

  const authorDocumentation = async (contentTypeId: string) => {
    const contentType = contentTypes.find(
      (candidate) => candidate.sys.id === contentTypeId,
    );
    if (!contentType) return;

    const entryId =
      getDocumentationEntryId(contentTypeId) ??
      (await createDocumentationEntry(contentType, { openAfterCreate: false }))
        .sys.id;

    await sdk.navigator.openEntry(entryId, { slideIn: { waitForClose: true } });
    await refetchDocumentationEntries();
  };

  const openPicker = async () => {
    const result: ContentTypePicker.Result | undefined =
      await sdk.dialogs.openCurrent({
        title: translate("field.addContentMenu.addContent"),
        width: "fullWidth",
        minHeight: "calc(100vh - 170px)",
        position: "center",
        shouldCloseOnEscapePress: true,
        shouldCloseOnOverlayClick: true,
        parameters: {
          type: "picker-dialog",
          data: {
            linkableContentTypeIds: getLinkableContentTypeIds(sdk.field),
            creatableContentTypeIds: creatableContentTypes.map(
              (contentType) => contentType.sys.id,
            ),
            canLinkEntity,
            isFull,
          },
        } satisfies InvocationData,
      });

    if (!result) return;
    if (result.action === "create") await onCreate(result.contentTypeId);
    else if (result.action === "link") onLinkExisting();
    else if (result.action === "authorDocumentation")
      await authorDocumentation(result.contentTypeId);
  };

  return (
    <div className={styles.container}>
      <Button
        className={styles.trigger}
        startIcon={<PlusIcon />}
        isDisabled={isDisabled}
        onClick={openPicker}
      >
        {translate("field.addContentMenu.addContent")}
      </Button>
    </div>
  );
};

const styles = {
  container: css({
    padding: tokens.spacingM,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px dashed ${tokens.gray300}`,
    // Matches the output min-height of adjacent elements
    minHeight: 89,
  }),
  trigger: css({ fontWeight: "bold" }),
};

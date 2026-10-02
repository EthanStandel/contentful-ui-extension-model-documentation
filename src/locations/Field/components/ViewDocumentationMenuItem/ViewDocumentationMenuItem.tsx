import { MenuItem } from "@contentful/f36-components";
import type { FieldAppSDK } from "@contentful/app-sdk";
import type { ContentType } from "@contentful/field-editor-reference";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useDocumentationEntryLookup } from "~/hooks/useDocumentationEntryLookup";
import type { InvocationData } from "~/hooks/useInvocationData";
import { translate } from "~/config/translate";

export const ViewDocumentationMenuItem = ({
  contentType,
}: {
  contentType: ContentType;
}) => {
  const sdk = useSDK<FieldAppSDK>();
  const { getDocumentationEntryId } = useDocumentationEntryLookup();

  return (
    <MenuItem
      testId="view-documentation"
      isDisabled={!getDocumentationEntryId(contentType.sys.id)}
      onClick={() =>
        sdk.dialogs.openCurrent({
          title: translate("documentation.dialogTitle", {
            contentTypeName: contentType.name,
          }),
          shouldCloseOnEscapePress: true,
          shouldCloseOnOverlayClick: true,
          width: "fullWidth",
          minHeight: "calc(100vh - 170px)",
          parameters: {
            type: "documentation-dialog",
            data: { contentTypeId: contentType.sys.id },
          } satisfies InvocationData,
        })
      }
    >
      {translate("field.documentedEntryCard.viewDocumentation")}
    </MenuItem>
  );
};

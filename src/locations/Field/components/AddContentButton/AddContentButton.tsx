import { Button } from "@contentful/f36-components";
import { PlusIcon } from "@contentful/f36-icons";
import type { FieldAppSDK } from "@contentful/app-sdk";
import type { CustomActionProps } from "@contentful/field-editor-reference";
import { useSDK } from "@contentful/react-apps-toolkit";
import { css } from "@emotion/css";
import tokens from "@contentful/f36-tokens";
import { useCreateOrEditDocumentation } from "~/hooks/useCreateOrEditDocumentation";
import { getLinkableContentTypeIds } from "~/locations/Field/utils/getLinkableContentTypeIds";
import { openContentTypePicker } from "~/locations/Field/utils/openContentTypePicker";
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
  const { createOrEditDocumentation } = useCreateOrEditDocumentation();

  const openPicker = async () => {
    const result = await openContentTypePicker(sdk, {
      linkableContentTypeIds: getLinkableContentTypeIds(sdk.field),
      creatableContentTypeIds: creatableContentTypes.map(
        (contentType) => contentType.sys.id,
      ),
      canLinkEntity,
      isFull,
    });

    if (!result) return;
    if (result.action === "create") await onCreate(result.contentTypeId);
    else if (result.action === "link") onLinkExisting();
    else if (result.action === "authorDocumentation")
      await createOrEditDocumentation(result.contentTypeId);
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

import * as React from "react";
import {
  EntityStatusBadge,
  EntryCard,
  MenuDivider,
  MenuItem,
} from "@contentful/f36-components";
import type { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import {
  AssetThumbnail,
  MissingEntityCard,
  type CustomEntityCardProps,
} from "@contentful/field-editor-reference";
import { entityHelpers, isValidImage } from "@contentful/field-editor-shared";
import { useDocumentationEntryLookup } from "~/hooks/useDocumentationEntryLookup";
import type { InvocationData } from "~/hooks/useInvocationData";
import { translate } from "~/config/translate";

const { getEntryTitle, getEntityDescription, getEntityStatus, getEntryImage } =
  entityHelpers;

export const DocumentedEntryCard = ({
  entity,
  contentType,
  localeCode,
  defaultLocaleCode,
  isDisabled,
  size,
  entityUrl,
  renderDragHandle,
  onEdit,
  onRemove,
  onMoveTop,
  onMoveBottom,
  useLocalizedEntityStatus,
  isClickable = true,
  hasCardEditActions = true,
  hasCardMoveActions = true,
  hasCardRemoveActions = true,
}: CustomEntityCardProps & {
  isClickable?: boolean;
  hasCardEditActions?: boolean;
  hasCardMoveActions?: boolean;
  hasCardRemoveActions?: boolean;
}) => {
  const sdk = useSDK<FieldAppSDK>();
  const { getDocumentationEntryId } = useDocumentationEntryLookup();
  const [file, setFile] = React.useState<any>(null);

  const entry = entity as any;
  const contentTypeId: string | undefined = entry?.sys?.contentType?.sys?.id;
  const documentationEntryId = contentTypeId
    ? getDocumentationEntryId(contentTypeId)
    : undefined;

  React.useEffect(() => {
    let mounted = true;
    if (!entry) return;

    getEntryImage(
      { entry, contentType, localeCode, defaultLocaleCode },
      (assetId: string) => sdk.cma.asset.get({ assetId }) as Promise<any>,
    )
      .then((file) => mounted && setFile(file))
      .catch(() => mounted && setFile(null));

    return () => {
      mounted = false;
    };
  }, [entry, contentType, localeCode, defaultLocaleCode, sdk]);

  const status = getEntityStatus(
    entry?.sys,
    useLocalizedEntityStatus ? localeCode : undefined,
  );

  if (status === "deleted") {
    return <MissingEntityCard isDisabled={isDisabled} onRemove={onRemove} />;
  }

  const title = getEntryTitle({
    entry,
    contentType,
    localeCode,
    defaultLocaleCode,
    defaultTitle: translate("field.documentedEntryCard.untitled"),
  });

  const description = getEntityDescription({
    entity: entry,
    contentType,
    localeCode,
    defaultLocaleCode,
  });

  const actions = [
    hasCardEditActions && onEdit ? (
      <MenuItem key="edit" testId="edit" onClick={() => onEdit()}>
        {translate("field.documentedEntryCard.edit")}
      </MenuItem>
    ) : null,
    contentType ? (
      <MenuItem
        key="documentation"
        testId="view-documentation"
        isDisabled={!documentationEntryId}
        onClick={() =>
          sdk.dialogs.openCurrent({
            title: translate("documentation.dialogTitle", {
              contentTypeName: contentType.name,
            }),
            shouldCloseOnEscapePress: true,
            shouldCloseOnOverlayClick: true,
            width: "large",
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
    ) : null,
    hasCardRemoveActions && onRemove && !isDisabled ? (
      <MenuItem key="delete" testId="delete" onClick={() => onRemove()}>
        {translate("field.documentedEntryCard.remove")}
      </MenuItem>
    ) : null,
    hasCardMoveActions && (onMoveTop || onMoveBottom) && !isDisabled ? (
      <MenuDivider key="divider" />
    ) : null,
    hasCardMoveActions && onMoveTop && !isDisabled ? (
      <MenuItem key="move-top" testId="move-top" onClick={() => onMoveTop()}>
        {translate("field.documentedEntryCard.moveToTop")}
      </MenuItem>
    ) : null,
    hasCardMoveActions && onMoveBottom && !isDisabled ? (
      <MenuItem
        key="move-bottom"
        testId="move-bottom"
        onClick={() => onMoveBottom()}
      >
        {translate("field.documentedEntryCard.moveToBottom")}
      </MenuItem>
    ) : null,
  ].filter(Boolean);

  return (
    <EntryCard
      as={isClickable && entityUrl ? "a" : "article"}
      href={isClickable ? entityUrl : undefined}
      title={title}
      description={description}
      contentType={contentType?.name}
      size={size}
      badge={<EntityStatusBadge entityStatus={status} />}
      thumbnailElement={
        file && isValidImage(file) ? <AssetThumbnail file={file} /> : undefined
      }
      dragHandleRender={renderDragHandle}
      withDragHandle={!!renderDragHandle && !isDisabled}
      draggable={!!renderDragHandle && !isDisabled}
      actions={actions}
      onClick={(event) => {
        if (!isClickable) return;
        event.preventDefault();
        onEdit?.();
      }}
    />
  );
};

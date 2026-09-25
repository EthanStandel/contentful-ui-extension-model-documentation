import type { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import {
  MultipleEntryReferenceEditor,
  SingleEntryReferenceEditor,
  type CustomActionProps,
  type CustomEntityCardProps,
} from "@contentful/field-editor-reference";
import { AddContentButton } from "./components/AddContentButton";
import { DocumentedEntryCard } from "./components/DocumentedEntryCard";
import { useAutoResizer } from "~/hooks/useAutoResizer";

export const EntryReferenceField = () => {
  const sdk = useSDK<FieldAppSDK>();
  useAutoResizer();

  const props = {
    sdk,
    viewType: "card",
    isInitiallyDisabled: false,
    hasCardEditActions: true,
    parameters: {
      instance: {
        showCreateEntityAction: true,
        showLinkEntityAction: true,
      },
    },
    renderCustomActions: (actions: CustomActionProps) => (
      <AddContentButton {...actions} />
    ),
    renderCustomCard: (card: CustomEntityCardProps) => (
      <DocumentedEntryCard {...card} />
    ),
  } as const;

  return sdk.field.type === "Link" ? (
    <SingleEntryReferenceEditor {...props} />
  ) : (
    <MultipleEntryReferenceEditor {...props} hasCardMoveActions />
  );
};

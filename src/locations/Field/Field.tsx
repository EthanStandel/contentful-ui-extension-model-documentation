import { useSDK, useFieldValue } from "@contentful/react-apps-toolkit";
import {
  Button,
  Stack,
  EntryCard,
  MenuItem,
  Menu,
} from "@contentful/f36-components";
import { BaseAppSDK, FieldAppSDK } from "@contentful/app-sdk";
import { type ArrayEntryFieldAPI } from "@contentful/app-sdk/dist/types/field.types";
import type { EntryProps, ContentTypeProps } from "contentful-management";
import { useEffect, useState } from "react";
import { ArrowDownIcon, PlusIcon, RichTextIcon } from "@contentful/f36-icons";

type Entry = {
  sys: { id: string };
};

type EntryReference = {
  sys: {
    id: string;
    type: "Link";
    linkType: "Entry";
  };
};

export const EntryReferenceListField = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [value, setValue] = useFieldValue<Array<EntryReference>>();

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  // TODO - not wired up to any control yet. This should back the
  // "Add existing content" menu item below.
  const handleAdd = async () => {
    const selected = await sdk.dialogs.selectMultipleEntries<Entry>();
    if (!selected) return;
    const links = selected.map((entry) => ({
      sys: {
        id: entry.sys.id,
        type: "Link",
        linkType: "Entry",
      } as const,
    }));
    setValue([...(value ?? []), ...links]);
  };

  const handleRemove = (id: string) => {
    setValue((value ?? []).filter((entry) => entry.sys.id !== id));
  };

  return (
    <Stack flexDirection="column" spacing="spacingS">
      {(value ?? []).map((entry, index) => (
        <EntryInstance
          key={`${entry.sys.id} - ${index}`}
          entry={entry}
          onRemove={() => handleRemove(entry.sys.id)}
        />
      ))}
      <div
        style={{
          padding: 32,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 6,
          border: "1px dashed rgb(103, 114, 138)",
        }}
      >
        <Menu>
          <Menu.Trigger>
            <Button
              style={{
                fontWeight: "bold",
              }}
              startIcon={<PlusIcon variant="secondary" />}
              endIcon={<ArrowDownIcon variant="secondary" />}
            >
              Add content
            </Button>
          </Menu.Trigger>
          <Menu.List>
            {/* TODO - no onClick; should call handleAdd */}
            <Menu.Item>Add existing content</Menu.Item>
            <Menu.Divider />
            <Menu.SectionTitle>New content</Menu.SectionTitle>
            {(sdk.field as any as ArrayEntryFieldAPI).items.validations
              ?.find((validation) => !!validation.linkContentType)
              ?.linkContentType?.map((contentType) => (
                <CreateNewContentTypeWithDocumentationOption
                  key={contentType}
                  id={contentType}
                />
              ))}
          </Menu.List>
        </Menu>
      </div>
    </Stack>
  );
};

const contentTypeCache = new Map<string, ContentTypeProps>();
const fetchContentType = async (sdk: BaseAppSDK, id: string) => {
  if (!contentTypeCache.has(id)) {
    contentTypeCache.set(
      id,
      await sdk.cma.contentType.get({ contentTypeId: id }),
    );
  }

  return contentTypeCache.get(id)!;
};

const CreateNewContentTypeWithDocumentationOption = ({
  id,
}: {
  id: string;
}) => {
  const sdk = useSDK<FieldAppSDK>();
  const [contentType, setContentType] = useState<null | ContentTypeProps>(null);

  useEffect(() => {
    (async () => {
      setContentType(await fetchContentType(sdk, id));
    })();
  }, [id]);

  if (!contentType) return null;

  return (
    <Menu.Submenu>
      <Menu.SubmenuTrigger>{contentType.name}</Menu.SubmenuTrigger>
      <Menu.List>
        {/* TODO - no onClick; should create an entry of this content type
            and open it (sdk.cma.entry.create + sdk.navigator.openNewEntry) */}
        <Menu.Item icon={<PlusIcon variant="secondary" />}>
          Create new entry
        </Menu.Item>
        <Menu.Item
          icon={<RichTextIcon variant="secondary" />}
          onClick={() =>
            sdk.dialogs.openCurrent({
              title: `${contentType.name ?? ""} documentation`,
              shouldCloseOnEscapePress: true,
              shouldCloseOnOverlayClick: true,
              allowHeightOverflow: true,
              width: "large",
              minHeight: 500,
              parameters: { contentTypeId: id },
            })
          }
        >
          View documentation
        </Menu.Item>
      </Menu.List>
    </Menu.Submenu>
  );
};

const EntryInstance = ({
  entry: entryReference,
  onRemove,
}: {
  entry: EntryReference;
  onRemove: () => void;
}) => {
  const sdk = useSDK<FieldAppSDK>();
  const [entry, setEntry] = useState<null | EntryProps>(null);
  const [contentType, setContentType] = useState<null | ContentTypeProps>(null);

  const id = entryReference.sys.id;
  useEffect(() => {
    (async () => {
      const entry = await sdk.cma.entry.get({ entryId: id });
      setEntry(entry);
      setContentType(await fetchContentType(sdk, entry.sys.contentType.sys.id));
    })();
  }, [id]);

  if (!entry || !contentType) return null;

  // The linked entry's own fields, so this is the space's default locale —
  // not parameters.documentationLocale, which only applies to documentation.
  const locale = sdk.locales.default;

  return (
    <EntryCard
      key={id}
      withDragHandle
      onClick={() => sdk.navigator.openEntry(id, { slideIn: true })}
      contentType={contentType.name}
      status={(entry.sys as any).fieldStatus?.["*"]?.[locale] ?? undefined}
      title={entry.fields?.[contentType.displayField]?.[locale] ?? ""}
      actions={[
        <MenuItem key="remove" onClick={onRemove}>
          Remove
        </MenuItem>,
      ]}
    />
  );
};

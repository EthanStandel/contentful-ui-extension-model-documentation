import { useMemo, useState } from "react";
import type { DialogAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import {
  Badge,
  Button,
  Flex,
  Heading,
  Text,
  TextInput,
} from "@contentful/f36-components";
import { PlusIcon } from "@contentful/f36-icons";
import { css, cx } from "@emotion/css";
import tokens from "@contentful/f36-tokens";
import { Documentation } from "~/components/Documentation";
import { useCanAuthorDocumentation } from "~/hooks/useCanAuthorDocumentation";
import { useDocumentationEntryLookup } from "~/hooks/useDocumentationEntryLookup";
import { useFetchAllContentType } from "~/hooks/useFetchAllContentType";
import { useInvocationData } from "~/hooks/useInvocationData";
import { translate } from "~/config/translate";

export namespace ContentTypePicker {
  export type Result =
    | { action: "create"; contentTypeId: string }
    | { action: "link" }
    | { action: "authorDocumentation"; contentTypeId: string };
}

export const ContentTypePicker = () => {
  const sdk = useSDK<DialogAppSDK>();
  const pickerData = useInvocationData("picker-dialog")?.data;

  const { contentTypes } = useFetchAllContentType();
  const { getDocumentationEntryId } = useDocumentationEntryLookup();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const linkable = useMemo(() => {
    const linkableContentTypeIds = pickerData?.linkableContentTypeIds;

    return linkableContentTypeIds
      ? contentTypes.filter((contentType) =>
          linkableContentTypeIds.includes(contentType.sys.id),
        )
      : contentTypes;
  }, [contentTypes, pickerData]);

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return linkable;
    return linkable.filter(
      (contentType) =>
        contentType.name.toLowerCase().includes(query) ||
        contentType.sys.id.toLowerCase().includes(query),
    );
  }, [linkable, search]);

  const selected =
    matches.find((contentType) => contentType.sys.id === selectedId) ??
    matches[0] ??
    null;
  const selectedDocumentationId = selected
    ? getDocumentationEntryId(selected.sys.id)
    : undefined;
  const canAuthorDocumentation = useCanAuthorDocumentation(
    selectedDocumentationId,
  );

  if (!pickerData) return null;

  const { creatableContentTypeIds, canLinkEntity, isFull } = pickerData;

  const close = (result: ContentTypePicker.Result) => sdk.close(result);

  return (
    <Flex flexDirection="column" className={styles.root}>
      <Flex className={styles.panes}>
        <Flex flexDirection="column" className={styles.list}>
          <div className={styles.search}>
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={translate("picker.search")}
              testId="picker-search"
            />
          </div>
          <div className={styles.listScroll}>
            {matches.length === 0 && (
              <Text className={styles.empty}>
                {translate("picker.noMatches")}
              </Text>
            )}
            {matches.map((contentType) => {
              const isSelected = contentType.sys.id === selected?.sys.id;
              const isDocumented = !!getDocumentationEntryId(
                contentType.sys.id,
              );

              return (
                <button
                  key={contentType.sys.id}
                  type="button"
                  onClick={() => setSelectedId(contentType.sys.id)}
                  className={cx(
                    styles.listItem,
                    isSelected && styles.listItemSelected,
                  )}
                  data-test-id={`picker-item-${contentType.sys.id}`}
                >
                  <div className={styles.listItemHeader}>
                    <Badge variant={isDocumented ? "positive" : "secondary"}>
                      {isDocumented
                        ? translate("picker.documented")
                        : translate("picker.undocumented")}
                    </Badge>
                  </div>
                  <Text
                    fontWeight="fontWeightDemiBold"
                    className={styles.listItemBody}
                  >
                    {contentType.name}
                  </Text>
                </button>
              );
            })}
          </div>
        </Flex>

        <Flex flexDirection="column" className={styles.detail}>
          {selected && (
            <>
              <Heading marginBottom="none">{selected.name}</Heading>
              <div className={styles.documentation}>
                <Documentation contentTypeId={selected.sys.id} />
              </div>
            </>
          )}
        </Flex>
      </Flex>

      <Flex
        className={styles.footer}
        justifyContent="space-between"
        alignItems="center"
        gap="spacingS"
      >
        <Flex gap="spacingS" alignItems="center">
          {selected && canAuthorDocumentation && (
            <Button
              variant="secondary"
              onClick={() =>
                close({
                  action: "authorDocumentation",
                  contentTypeId: selected.sys.id,
                })
              }
            >
              {selectedDocumentationId
                ? translate("picker.editDocumentation")
                : translate("picker.createDocumentation")}
            </Button>
          )}
        </Flex>
        <Flex gap="spacingS" alignItems="center">
          {isFull && (
            <Text fontColor="gray600">{translate("picker.fieldFull")}</Text>
          )}
          {canLinkEntity && (
            <Button
              variant="secondary"
              isDisabled={isFull}
              onClick={() => close({ action: "link" })}
            >
              {translate("picker.addExisting")}
            </Button>
          )}
          {selected && (
            <Button
              variant="primary"
              startIcon={<PlusIcon />}
              isDisabled={
                isFull || !creatableContentTypeIds.includes(selected.sys.id)
              }
              onClick={() =>
                close({ action: "create", contentTypeId: selected.sys.id })
              }
            >
              {translate("picker.createNewEntry")}
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

const styles = {
  root: css({ height: "100vh", minHeight: 0 }),
  panes: css({ flex: 1, minHeight: 0, alignItems: "stretch" }),
  list: css({
    width: 320,
    flexShrink: 0,
    borderRight: `1px solid ${tokens.gray200}`,
    minHeight: 0,
  }),
  search: css({ padding: tokens.spacingM }),
  listScroll: css({
    overflowY: "auto",
    flex: 1,
    padding: `0 ${tokens.spacingM} ${tokens.spacingM}`,
  }),
  listItem: css({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: 0,
    marginBottom: tokens.spacingXs,
    background: "none",
    border: `1px solid ${tokens.gray200}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: "pointer",
    textAlign: "left",
    "&:hover": { backgroundColor: tokens.gray100 },
  }),
  listItemHeader: css({
    padding: `${tokens.spacingXs} ${tokens.spacingS}`,
    borderBottom: "1px solid",
    borderBottomColor: "inherit",
  }),
  listItemBody: css({ padding: `${tokens.spacingXs} ${tokens.spacingS}` }),
  listItemSelected: css({
    backgroundColor: tokens.blue100,
    borderColor: tokens.blue300,
    "&:hover": { backgroundColor: tokens.blue100 },
  }),
  empty: css({ color: tokens.gray600 }),
  detail: css({
    flex: 1,
    minWidth: 0,
    padding: tokens.spacingL,
    overflowY: "auto",
  }),
  documentation: css({ flexShrink: 0, marginTop: tokens.spacingM }),
  footer: css({
    flexShrink: 0,
    minHeight: 68,
    borderTop: `1px solid ${tokens.gray200}`,
    padding: tokens.spacingM,
  }),
};

import { IconButton, Menu, Table } from "@contentful/f36-components";
import { useAppParameters } from "../../../../hooks/useAppParameters";
import { useFetchAllContentType } from "../../../../hooks/useFetchAllContentType";
import { useFetchAllDocumentationEntries } from "../../../../hooks/useFetchAllDocumentationEntries";
import { DotsThreeIcon } from "@contentful/f36-icons";

export const ContentTypeDocumentationInstallationTable = () => {
  const { sdk, parameters } = useAppParameters();
  const { contentTypes } = useFetchAllContentType();
  const { documentationEntries, refetchDocumentationEntries } =
    useFetchAllDocumentationEntries();

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Cell>{CONSTANTS.name}</Table.Cell>
          <Table.Cell>{CONSTANTS.id}</Table.Cell>
          <Table.Cell align="right">{CONSTANTS.actions}</Table.Cell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {contentTypes.map((ct) => {
          const documentation = documentationEntries.find(
            (entry) =>
              entry.fields[parameters.documentationModel.fields.type.id]?.[
                parameters.documentationLocale
              ] === ct.sys.id,
          );
          return (
            <Table.Row key={ct.sys.id}>
              <Table.Cell>{ct.name}</Table.Cell>
              <Table.Cell>{ct.sys.id}</Table.Cell>
              <Table.Cell align="right">
                <Menu>
                  <Menu.Trigger>
                    <IconButton
                      variant="transparent"
                      size="small"
                      icon={<DotsThreeIcon size="small" />}
                      aria-label={CONSTANTS.openMenu}
                    />
                  </Menu.Trigger>
                  <Menu.List>
                    <Menu.Item
                      isDisabled={!!documentation}
                      onClick={async () => {
                        const created = await sdk.cma.entry.create(
                          {
                            spaceId: sdk.ids.space,
                            environmentId: sdk.ids.environment,
                            contentTypeId:
                              parameters.documentationModel.contentTypeId,
                          },
                          {
                            fields: {
                              [parameters.documentationModel.fields.label.id]: {
                                [parameters.documentationLocale]:
                                  CONSTANTS.documentationDefaultLabel(ct.name),
                              },
                              [parameters.documentationModel.fields.type.id]: {
                                [parameters.documentationLocale]: ct.sys.id,
                              },
                            },
                          },
                        );
                        await refetchDocumentationEntries();
                        await sdk.navigator.openEntry(created.sys.id);
                      }}
                    >
                      {CONSTANTS.createDocumentation}
                    </Menu.Item>
                    <Menu.Item
                      isDisabled={!documentation}
                      onClick={() =>
                        sdk.navigator.openEntry(documentation?.sys.id!)
                      }
                    >
                      {CONSTANTS.viewEditDocumentation}
                    </Menu.Item>
                  </Menu.List>
                </Menu>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

const CONSTANTS = {
  name: "Name",
  id: "ID",
  actions: "Actions",
  createDocumentation: "Create documentation",
  viewEditDocumentation: "View/Edit documentation",
  documentationDefaultLabel: (name: string) =>
    `[INTERNAL] "${name}" documentation`,
  openMenu: "Open menu",
};

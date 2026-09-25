import { IconButton, Menu, Table } from "@contentful/f36-components";
import { useAppParameters } from "~/hooks/useAppParameters";
import { useFetchAllContentType } from "~/hooks/useFetchAllContentType";
import { useFetchAllDocumentationEntries } from "~/hooks/useFetchAllDocumentationEntries";
import { DotsThreeIcon } from "@contentful/f36-icons";
import { useCreateDocumentationEntry } from "~/hooks/useCreateDocumentationEntry";
import { translate } from "~/config/translate";

export const ContentTypeDocumentationInstallationTable = () => {
  const { sdk, parameters } = useAppParameters();
  const createDocumentationEntry = useCreateDocumentationEntry();
  const { contentTypes } = useFetchAllContentType();
  const { documentationEntries } = useFetchAllDocumentationEntries();

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Cell>
            {translate(
              "configScreen.contentTypeDocumentationInstallationTable.name",
            )}
          </Table.Cell>
          <Table.Cell>
            {translate(
              "configScreen.contentTypeDocumentationInstallationTable.id",
            )}
          </Table.Cell>
          <Table.Cell align="right">
            {translate(
              "configScreen.contentTypeDocumentationInstallationTable.actions",
            )}
          </Table.Cell>
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
                      aria-label={translate(
                        "configScreen.contentTypeDocumentationInstallationTable.openMenu",
                      )}
                    />
                  </Menu.Trigger>
                  <Menu.List>
                    <Menu.Item
                      isDisabled={!!documentation}
                      onClick={() => createDocumentationEntry(ct)}
                    >
                      {translate(
                        "configScreen.contentTypeDocumentationInstallationTable.createDocumentation",
                      )}
                    </Menu.Item>
                    <Menu.Item
                      isDisabled={!documentation}
                      onClick={() =>
                        sdk.navigator.openEntry(documentation?.sys.id!)
                      }
                    >
                      {translate(
                        "configScreen.contentTypeDocumentationInstallationTable.viewEditDocumentation",
                      )}
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

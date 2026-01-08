import {
  Heading,
  Paragraph,
  Flex,
  Table,
  Menu,
  IconButton,
} from "@contentful/f36-components";
import { css } from "emotion";
import { useDocumentationTypeExists } from "../../hooks/useDocumentationTypeExists";
import { useAppParameters } from "../../hooks/useAppParameters";
import { CreateDocumentationTypeButtonGroup } from "./components/CreateDocumentationTypeButtonGroup/CreateDocumentationTypeButtonGroup";
import { useFetchAllContentType } from "../../hooks/useFetchAllContentType";
import { useFetchAllDocumentationEntries } from "../../hooks/useFetchAllDocumentationEntries";
import { DotsThreeIcon } from "@contentful/f36-icons";

export const ConfigScreen = () => {
  const { sdk, parameters } = useAppParameters();
  const labels = parameters.labels.configScreen;
  const { exists } = useDocumentationTypeExists();
  const { contentTypes } = useFetchAllContentType();
  const { documentationEntries, refetchDocumentationEntries } =
    useFetchAllDocumentationEntries();

  return (
    <Flex flexDirection="column" gap="2rem" className={css({ margin: "80px" })}>
      <Heading>{labels.heading}</Heading>
      <Flex flexDirection="column" gap="1rem">
        {labels.subheading.map((p, index) => (
          <Paragraph key={index}>{p}</Paragraph>
        ))}
      </Flex>
      <CreateDocumentationTypeButtonGroup />
      {exists && (
        <Flex flexDirection="column" gap="1rem">
          <Paragraph>{labels.documentModels}</Paragraph>
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Cell>Name</Table.Cell>
                <Table.Cell>ID</Table.Cell>
                <Table.Cell align="right">Actions</Table.Cell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {contentTypes.map((ct) => {
                const documentation = documentationEntries.find(
                  (entry) =>
                    entry.fields.typeId[parameters.documentationLocale] ===
                    ct.sys.id,
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
                            aria-label="Open menu"
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
                                    [parameters.documentationModel.fields.label
                                      .id]: {
                                      [parameters.documentationLocale]: `[INTERNAL] "${ct.name}" documentation`,
                                    },
                                    [parameters.documentationModel.fields.type
                                      .id]: {
                                      [parameters.documentationLocale]:
                                        ct.sys.id,
                                    },
                                  },
                                },
                              );
                              await refetchDocumentationEntries();
                              await sdk.navigator.openEntry(created.sys.id);
                            }}
                          >
                            Create documentation
                          </Menu.Item>
                          <Menu.Item
                            isDisabled={!documentation}
                            onClick={() =>
                              sdk.navigator.openEntry(documentation?.sys.id!)
                            }
                          >
                            View/Edit documentation
                          </Menu.Item>
                        </Menu.List>
                      </Menu>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Flex>
      )}
    </Flex>
  );
};

export default ConfigScreen;

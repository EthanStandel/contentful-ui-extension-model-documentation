import { Heading, Paragraph, Flex } from "@contentful/f36-components";
import { css } from "emotion";
import { useDocumentationTypeExists } from "../../hooks/useDocumentationTypeExists";
import { CreateDocumentationTypeButtonGroup } from "./components/CreateDocumentationTypeButtonGroup/CreateDocumentationTypeButtonGroup";
import { ContentTypeDocumentationInstallationTable } from "./components/ContentTypeDocumentationInstallationTable";

// TODO - this screen always operates on AppInstallationParameters.getDefault().
// The schema already supports customizing the content type ID, label, field
// names and locale, but there's no UI to edit them yet.
export const ConfigScreen = () => {
  const { exists } = useDocumentationTypeExists();

  return (
    <Flex flexDirection="column" gap="2rem" className={css({ margin: "80px" })}>
      <Heading>{CONSTANTS.heading}</Heading>
      <Flex flexDirection="column" gap="1rem">
        {CONSTANTS.subheading.map((p, index) => (
          <Paragraph key={index}>{p}</Paragraph>
        ))}
      </Flex>
      <CreateDocumentationTypeButtonGroup />
      {exists && (
        <Flex flexDirection="column" gap="1rem">
          <Paragraph>{CONSTANTS.documentModels}</Paragraph>
          <ContentTypeDocumentationInstallationTable />
        </Flex>
      )}
    </Flex>
  );
};

const CONSTANTS = {
  heading: "Contentful Model Documentation UI Extension",
  subheading: [
    "This plugin creates one content type to represent the documentation for all other content types.",
  ],
  documentModels:
    "Create or view documentation for the content-types listed below",
};

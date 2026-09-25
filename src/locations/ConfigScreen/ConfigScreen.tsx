import { Heading, Paragraph, Flex } from "@contentful/f36-components";
import { css } from "@emotion/css";
import tokens from "@contentful/f36-tokens";
import { useDocumentationTypeExists } from "~/hooks/useDocumentationTypeExists";
import { CreateDocumentationTypeButtonGroup } from "./components/CreateDocumentationTypeButtonGroup/CreateDocumentationTypeButtonGroup";
import { ContentTypeDocumentationInstallationTable } from "./components/ContentTypeDocumentationInstallationTable";
import { translate } from "~/config/translate";

// TODO - this screen always operates on AppInstallationParameters.getDefault().
// The schema already supports customizing the content type ID, label, field
// names and locale, but there's no UI to edit them yet.
export const ConfigScreen = () => {
  const { exists } = useDocumentationTypeExists();

  return (
    <Flex
      flexDirection="column"
      gap="spacingXl"
      className={css({ margin: tokens.spacing4Xl })}
    >
      <Heading>{translate("configScreen.heading")}</Heading>
      <Paragraph>{translate("configScreen.subheading")}</Paragraph>
      <CreateDocumentationTypeButtonGroup />
      {exists && (
        <Flex flexDirection="column" gap="spacingM">
          <Paragraph>{translate("configScreen.documentModels")}</Paragraph>
          <ContentTypeDocumentationInstallationTable />
        </Flex>
      )}
    </Flex>
  );
};

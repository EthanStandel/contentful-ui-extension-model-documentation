import { DialogAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { css } from "@emotion/css";
import tokens from "@contentful/f36-tokens";
import { Documentation } from "~/components/Documentation";
import { useInvocationData } from "~/hooks/useInvocationData";
import { ContentTypePicker } from "./components/ContentTypePicker";

export const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const invocation = useInvocationData();

  switch (invocation?.type) {
    case "picker-dialog":
      return <ContentTypePicker />;
    case "documentation-dialog":
      return (
        <Documentation
          contentTypeId={invocation.data.contentTypeId}
          className={styles.documentation}
        />
      );
    default:
      sdk.close();
      return null;
  }
};

const styles = {
  documentation: css({
    height: "100vh",
    overflowY: "auto",
    padding: `${tokens.spacingM} ${tokens.spacingL}`,
  }),
};

import { DialogAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Documentation } from "../../components/Documentation";
import { css } from "emotion";

export const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();

  const contentTypeId = (sdk.parameters.invocation as any)
    ?.contentTypeId as string;

  if (!contentTypeId) {
    sdk.close();
    return null;
  }

  return (
    <Documentation
      contentTypeId={contentTypeId}
      className={css({ padding: "16px 24px" })}
    />
  );
};

import { DialogAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Documentation } from "./Sidebar";

const Dialog = () => {
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
      style={{ padding: "16px 24px" }}
    />
  );
};

export default Dialog;

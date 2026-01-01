import classes from "./Dialog.module.css";

import { DialogAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Documentation } from "../../components/Documentation";

export const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();

  const contentTypeId = (sdk.parameters.invocation as any)
    ?.contentTypeId as string;

  if (!contentTypeId) {
    sdk.close();
    return null;
  }

  return (
    <Documentation contentTypeId={contentTypeId} className={classes.root} />
  );
};

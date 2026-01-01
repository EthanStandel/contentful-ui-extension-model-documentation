import * as classes from "./Sidebar.module.css";

import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Documentation } from "../../components/Documentation";

export const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();

  return (
    <details>
      <summary className={classes.summary}>Documentation</summary>
      <Documentation contentTypeId={sdk.contentType.sys.id} />
    </details>
  );
};

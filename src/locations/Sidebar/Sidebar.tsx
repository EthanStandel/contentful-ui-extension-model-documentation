import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Documentation } from "../../components/Documentation";
import { css } from "emotion";

export const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();

  return (
    <details>
      <summary className={css({ cursor: "pointer" })}>Documentation</summary>
      <Documentation contentTypeId={sdk.contentType.sys.id} />
    </details>
  );
};

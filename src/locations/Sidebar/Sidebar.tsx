import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Documentation } from "~/components/Documentation";
import { css } from "@emotion/css";
import { translate } from "~/config/translate";
import { useAutoResizer } from "~/hooks/useAutoResizer";

export const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  useAutoResizer();

  return (
    <details>
      <summary className={css({ cursor: "pointer" })}>
        {translate("sidebar.summary")}
      </summary>
      <Documentation contentTypeId={sdk.contentType.sys.id} />
    </details>
  );
};

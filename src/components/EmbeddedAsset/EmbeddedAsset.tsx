import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Node } from "@contentful/rich-text-types";
import { css } from "@emotion/css";
import useSWR from "swr";
import { useAppParameters } from "~/hooks/useAppParameters";

export const EmbeddedAsset = ({ node }: { node: Node }) => {
  const sdk = useSDK<SidebarAppSDK>();
  const { parameters } = useAppParameters();
  const { data: asset } = useSWR(
    ["sdk.cma.asset.get", sdk, node.data.target.sys.id],
    async ([, sdk, assetId]) => {
      const response = await sdk.cma.asset.get({ assetId });
      if (!response || !response.fields) return;
      return response;
    },
  );

  if (!asset) return null;

  const fileUrl = asset.fields.file?.[parameters.documentationLocale]?.url;

  return (
    <a href={fileUrl} target="_blank" rel="noreferrer">
      <img
        src={fileUrl}
        alt={
          asset.fields.description?.[parameters.documentationLocale] ||
          asset.fields.title?.[parameters.documentationLocale] ||
          ""
        }
        className={css({ maxWidth: "100%", height: "auto" })}
      />
    </a>
  );
};

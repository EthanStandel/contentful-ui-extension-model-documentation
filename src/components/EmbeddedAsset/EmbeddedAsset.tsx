import classes from "./EmbeddedAsset.module.css";

import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AssetProps } from "contentful-management";
import { useEffect, useState } from "react";
import { Node } from "@contentful/rich-text-types";

export const EmbeddedAsset = ({ node }: { node: Node }) => {
  const sdk = useSDK<SidebarAppSDK>();
  const [asset, setAsset] = useState<AssetProps | null>(null);

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk]);

  useEffect(() => {
    (async () => {
      const response = await sdk.cma.asset.get({
        assetId: node.data.target.sys.id,
      });
      if (!response || !response.fields) return;
      setAsset(response);
    })();
  }, [sdk, node]);

  if (!asset) return null;

  const fileUrl = asset.fields.file?.["en-US"]?.url;

  return (
    <a href={fileUrl} target="_blank" rel="noreferrer">
      <img
        src={fileUrl}
        alt={
          asset.fields.description?.["en-US"] ||
          asset.fields.title?.["en-US"] ||
          ""
        }
        className={classes.img}
      />
    </a>
  );
};

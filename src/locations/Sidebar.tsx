import { Paragraph } from "@contentful/f36-components";
import { BaseAppSDK, SidebarAppSDK } from "@contentful/app-sdk";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import {
  documentToReactComponents,
  Options as RichTextRenderOptions,
} from "@contentful/rich-text-react-renderer";
import {
  Document as RichTextDocument,
  BLOCKS,
  Node,
} from "@contentful/rich-text-types";
import { AssetProps } from "contentful-management";

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => <EmbeddedAsset node={node} />,
  },
} satisfies RichTextRenderOptions;

const EmbeddedAsset = ({ node }: { node: Node }) => {
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
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </a>
  );
};

export const Documentation = ({
  contentTypeId,
  style = {},
}: {
  contentTypeId: string;
  style?: CSSProperties;
}) => {
  const sdk = useSDK();

  const [documentationRender, setDocumentationRender] =
    useState<ReactNode>(null);

  useEffect(() => {
    (async () => {
      const response = await sdk.cma.entry.getMany({
        query: {
          content_type: "internalContentfulDocumentation",
          include: 1,
          "fields.typeId[match]": contentTypeId,
        },
      });
      if (response.items.length < 1) return;
      const [result] = response.items;
      setDocumentationRender(
        documentToReactComponents(
          result.fields.documentation["en-US"] as RichTextDocument,
          richTextOptions
        )
      );
    })();
  }, [sdk]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        lineHeight: 1.15,
        ...style,
      }}
    >
      {documentationRender}
    </div>
  );
};

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();

  return <Documentation contentTypeId={sdk.contentType.sys.id} />;
};

export default Sidebar;

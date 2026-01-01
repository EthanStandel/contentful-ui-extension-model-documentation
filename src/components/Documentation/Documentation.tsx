import classes from "./Documentation.module.css";

import { useSDK } from "@contentful/react-apps-toolkit";
import {
  documentToReactComponents,
  Options as RichTextRenderOptions,
} from "@contentful/rich-text-react-renderer";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import {
  Document as RichTextDocument,
  BLOCKS,
} from "@contentful/rich-text-types";
import { EmbeddedAsset } from "../EmbeddedAsset";
import { cx } from "emotion";

export type DocumentationProps = {
  contentTypeId: string;
} & Omit<ComponentProps<"div">, "children">;

export const Documentation = ({
  contentTypeId,
  ...props
}: DocumentationProps) => {
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
          richTextOptions,
        ),
      );
    })();
  }, [sdk]);

  return (
    <div className={cx(classes.root, props.className)} {...props}>
      {documentationRender}
    </div>
  );
};

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => <EmbeddedAsset node={node} />,
  },
} satisfies RichTextRenderOptions;

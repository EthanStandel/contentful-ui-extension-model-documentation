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
import { css, cx } from "emotion";
import { Flex } from "@contentful/f36-components";

export type DocumentationProps = {
  contentTypeId: string;
} & Omit<ComponentProps<typeof Flex>, "children">;

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
    <Flex
      flexDirection="column"
      gap="16px"
      className={cx(css({ lineHeight: "1.15" }), props.className)}
      {...props}
    >
      {documentationRender}
    </Flex>
  );
};

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => <EmbeddedAsset node={node} />,
  },
} satisfies RichTextRenderOptions;

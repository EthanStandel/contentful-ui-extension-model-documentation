import { useSDK } from "@contentful/react-apps-toolkit";
import {
  documentToReactComponents,
  Options as RichTextRenderOptions,
} from "@contentful/rich-text-react-renderer";
import { ComponentProps, useEffect, useMemo } from "react";
import {
  Document as RichTextDocument,
  BLOCKS,
} from "@contentful/rich-text-types";
import { EmbeddedAsset } from "../EmbeddedAsset";
import { css, cx } from "emotion";
import { Flex } from "@contentful/f36-components";
import useSWR from "swr";
import { useAppParameters } from "../../hooks/useAppParameters";
import type { WindowAPI } from "@contentful/app-sdk";

export const Documentation = ({
  contentTypeId,
  ...props
}: {
  contentTypeId: string;
} & Omit<ComponentProps<typeof Flex>, "children">) => {
  const sdk = useSDK();
  const { parameters } = useAppParameters();

  useEffect(() => {
    const window = "window" in sdk ? (sdk.window as WindowAPI) : null;
    if (!window) return;
    window.startAutoResizer();
  }, [sdk]);

  const { data: documentation } = useSWR(
    [
      "sdk.cma.entry.getMany",
      contentTypeId,
      parameters.documentationModel.contentTypeId,
      parameters.documentationModel.fields.type.id,
    ],
    async ([, contentTypeId, documentationContentTypeId, typeFieldId]) => {
      const response = await sdk.cma.entry.getMany({
        query: {
          content_type: documentationContentTypeId,
          include: 1,
          [`fields.${typeFieldId}`]: contentTypeId,
        },
      });
      if (response.items.length < 1) return null;
      const [result] = response.items;
      return result;
    },
  );

  const documentationRender = useMemo(
    () =>
      documentation &&
      documentToReactComponents(
        documentation.fields.documentation[
          parameters.documentationLocale
        ] as RichTextDocument,
        richTextOptions,
      ),
    [documentation, parameters.documentationLocale],
  );

  if (!documentationRender) return null;

  return (
    <Flex
      flexDirection="column"
      gap="1rem"
      className={cx(
        css({ lineHeight: "1.15", paddingTop: "1rem" }),
        props.className,
      )}
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

import { useSDK } from "@contentful/react-apps-toolkit";
import {
  documentToReactComponents,
  Options as RichTextRenderOptions,
} from "@contentful/rich-text-react-renderer";
import { ComponentProps, useMemo } from "react";
import {
  Document as RichTextDocument,
  BLOCKS,
  INLINES,
} from "@contentful/rich-text-types";
import { EmbeddedAsset } from "~/components/EmbeddedAsset";
import { css, cx } from "@emotion/css";
import tokens from "@contentful/f36-tokens";
import { Flex, Note } from "@contentful/f36-components";
import useSWR from "swr";
import { useAppParameters } from "~/hooks/useAppParameters";
import { useCanAuthorDocumentation } from "~/hooks/useCanAuthorDocumentation";
import { translate } from "~/config/translate";

export const Documentation = ({
  contentTypeId,
  ...props
}: {
  contentTypeId: string;
} & Omit<ComponentProps<typeof Flex>, "children">) => {
  const sdk = useSDK();
  const { parameters } = useAppParameters();

  const { data: published } = useSWR(
    [
      "sdk.cma.entry.getPublished",
      contentTypeId,
      parameters.documentationModel.contentTypeId,
      parameters.documentationModel.fields.type.id,
    ],
    async ([, contentTypeId, documentationContentTypeId, typeFieldId]) => {
      const response = await sdk.cma.entry.getPublished({
        query: {
          content_type: documentationContentTypeId,
          include: 1,
          [`fields.${typeFieldId}`]: contentTypeId,
        },
      });
      return response.items[0] ?? null;
    },
  );

  const { data: unpublished } = useSWR(
    published === null
      ? [
          "sdk.cma.entry.getMany",
          contentTypeId,
          parameters.documentationModel.contentTypeId,
          parameters.documentationModel.fields.type.id,
        ]
      : null,
    async ([, contentTypeId, documentationContentTypeId, typeFieldId]) => {
      const response = await sdk.cma.entry.getMany({
        query: {
          content_type: documentationContentTypeId,
          [`fields.${typeFieldId}`]: contentTypeId,
        },
      });
      return response.items[0] ?? null;
    },
  );

  const canAuthorDocumentation = useCanAuthorDocumentation(unpublished?.sys.id);

  const documentationRender = useMemo(() => {
    const body = published?.fields.documentation?.[
      parameters.documentationLocale
    ] as RichTextDocument | undefined;

    return body && documentToReactComponents(body, richTextOptions);
  }, [published, parameters.documentationLocale]);

  if (
    published === undefined ||
    (published === null && unpublished === undefined)
  )
    return null;

  return (
    <Flex
      flexDirection="column"
      gap="spacingM"
      className={cx(
        css({ lineHeight: "1.15", paddingTop: tokens.spacingM }),
        props.className,
      )}
      {...props}
    >
      {documentationRender ??
        (unpublished && canAuthorDocumentation ? (
          <Note variant="warning">
            {translate("documentation.unpublished")}
          </Note>
        ) : (
          <Note variant="neutral">{translate("documentation.none")}</Note>
        ))}
    </Flex>
  );
};

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => <EmbeddedAsset node={node} />,
    [INLINES.HYPERLINK]: (node, children) =>
      /^iframe$/.test(
        node.content
          .map((child) => (child.nodeType === "text" ? child.value : ""))
          .join(""),
      ) ? (
        <iframe
          src={node.data.uri}
          title={node.data.uri}
          allowFullScreen
          className={css({
            width: "100%",
            aspectRatio: "16 / 9",
            border: `1px solid ${tokens.gray300}`,
          })}
        />
      ) : (
        <a href={node.data.uri}>{children}</a>
      ),
  },
} satisfies RichTextRenderOptions;

import { useState } from "react";
import { ConfigAppSDK } from "@contentful/app-sdk";
import { Flex, Button, Tooltip } from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useIsInstalled } from "../../../../hooks/useIsInstalled";
import { useDocumentationTypeExists } from "../../../../hooks/useDocumentationTypeExists";
import { useAppParameters } from "../../../../hooks/useAppParameters";
import { contentfulUrl } from "../../../../utils/contentfulUrl";
import { createDocumentationType } from "./utils/createDocumentationType";

export const CreateDocumentationTypeButtonGroup = () => {
  const [loading, setLoading] = useState(false);
  const { parameters } = useAppParameters();
  const sdk = useSDK<ConfigAppSDK>();
  const isInstalled = useIsInstalled();
  const { exists, updating, update } = useDocumentationTypeExists();

  const createCTATooltipMessage = (() => {
    if (!isInstalled) {
      return CONSTANTS.createCta.tooltip.uninstalled;
    } else if (exists) {
      return CONSTANTS.createCta.tooltip.exists;
    } else return "";
  })();

  return (
    <Flex gap="1rem" flexWrap="wrap">
      <Tooltip
        placement="top"
        content={createCTATooltipMessage}
        isDisabled={!createCTATooltipMessage}
      >
        <Button
          isLoading={updating}
          isDisabled={!isInstalled || exists || loading || updating}
          variant="primary"
          onClick={async () => {
            try {
              setLoading(true);
              await createDocumentationType(sdk, parameters);
              await update();
            } finally {
              setLoading(false);
            }
          }}
        >
          {CONSTANTS.createCta.label}
        </Button>
      </Tooltip>
      {exists && (
        <Button
          as="a"
          target="_blank"
          rel="noopener noreferrer"
          href={contentfulUrl(
            sdk,
            `content_types/${parameters.documentationModel.contentTypeId}`,
          )}
        >
          {CONSTANTS.viewCta.label}
        </Button>
      )}
    </Flex>
  );
};

const CONSTANTS = {
  createCta: {
    label: "Create documentation content type",
    tooltip: {
      uninstalled:
        "The content type cannot be generated until this extension is installed to your space.",
      exists: "This content type already exists",
    },
  },
  viewCta: {
    label: "View documentation content type",
  },
};

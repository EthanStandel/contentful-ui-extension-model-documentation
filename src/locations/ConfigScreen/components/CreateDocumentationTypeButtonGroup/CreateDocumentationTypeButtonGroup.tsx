import { useState } from "react";
import { ConfigAppSDK } from "@contentful/app-sdk";
import { Flex, Button, Tooltip } from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useIsInstalled } from "../../../../hooks/useIsInstalled";
import { useDocumentationTypeExists } from "../../../../hooks/useDocumentationTypeExists";
import { useAppParameters } from "../../../../hooks/useAppParameters";
import { createDocumentationType } from "./utils/createDocumentationType";

export const CreateDocumentationTypeButtonGroup = () => {
  const [loading, setLoading] = useState(false);
  const { parameters } = useAppParameters();
  const labels = parameters.labels.configScreen;
  const sdk = useSDK<ConfigAppSDK>();
  const isInstalled = useIsInstalled();
  const { exists, updating, update } = useDocumentationTypeExists();

  const createCTATooltipMessage = (() => {
    if (!isInstalled) {
      return labels.cta.createDocumentationContentType.tooltip.uninstalled;
    } else if (exists) {
      return labels.cta.createDocumentationContentType.tooltip.exists;
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
          {labels.cta.createDocumentationContentType.label}
        </Button>
      </Tooltip>
      {exists && (
        <Button
          as="a"
          target="_top"
          // Does not work on local, but should work when deployed on same-origin
          href={`/spaces/${sdk.ids.space}/environments/${sdk.ids.environment}/content_types/${parameters.documentationModel.contentTypeId}`}
        >
          {labels.cta.viewDocumentationContentType.label}
        </Button>
      )}
    </Flex>
  );
};

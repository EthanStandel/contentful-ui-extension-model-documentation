import { ConfigAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AppInstallationParameters } from "~/config/AppInstallationParameters";
import { useEffect, useState } from "react";
import { useStableResponse } from "./useStableResponse";

export const useAppParameters = () => {
  const [parameters, setParameters] = useState(
    AppInstallationParameters.getDefault,
  );
  const sdk = useSDK<ConfigAppSDK>();

  useEffect(() => {
    sdk.app?.onConfigure(async () => {
      const currentState = await sdk.app?.getCurrentState();

      return {
        parameters,
        targetState: currentState,
      };
    });
  }, [sdk, parameters]);

  useEffect(() => {
    (async () => {
      const currentParameters =
        (await sdk.app?.getParameters()) ?? sdk.parameters.installation;

      if (AppInstallationParameters.isValid(currentParameters)) {
        setParameters(currentParameters);
      }
      sdk.app?.setReady();
    })();
  }, [sdk]);

  return useStableResponse({ parameters, setParameters, sdk });
};

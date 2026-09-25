import { ConfigAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import useSWR from "swr";

export const useIsInstalled = () => {
  const sdk = useSDK<ConfigAppSDK>();
  const { data: isInstalled } = useSWR(["sdk.app.isInstalled", sdk], () =>
    sdk.app.isInstalled(),
  );
  return !!isInstalled;
};

import { useEffect } from "react";
import type { WindowAPI } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";

export const useAutoResizer = () => {
  const sdk = useSDK();

  useEffect(() => {
    const window = "window" in sdk ? (sdk.window as WindowAPI) : null;
    window?.startAutoResizer();
  }, [sdk]);
};

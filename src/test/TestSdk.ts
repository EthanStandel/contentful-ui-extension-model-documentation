import type { BaseAppSDK } from "@contentful/app-sdk";

export namespace TestSdk {
  let current: BaseAppSDK | null = null;

  export const set = (sdk: BaseAppSDK) => {
    current = sdk;
  };

  export const get = (): BaseAppSDK => {
    if (!current)
      throw new Error("No test SDK set; call a Mock*.render first.");
    return current;
  };
}

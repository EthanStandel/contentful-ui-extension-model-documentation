import { useMemo } from "react";
import { locations } from "@contentful/app-sdk";
import { EntryReferenceListField } from "./locations/Field";
import { Dialog } from "./locations/Dialog";
import { Sidebar } from "./locations/Sidebar/Sidebar";
import { useSDK } from "@contentful/react-apps-toolkit";
import { ConfigScreen } from "./locations/ConfigScreen";

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  [locations.LOCATION_ENTRY_FIELD]: EntryReferenceListField,
  [locations.LOCATION_ENTRY_EDITOR]: null,
  [locations.LOCATION_DIALOG]: Dialog,
  [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
  [locations.LOCATION_PAGE]: null,
  [locations.LOCATION_HOME]: null,
};

const App = () => {
  const sdk = useSDK();

  const Component = useMemo(() => {
    const [, component] =
      Object.entries(ComponentLocationSettings).find(([location]) => {
        if (sdk.location.is(location)) return true;
      }) ?? [];

    return component;
  }, [sdk.location]);

  return Component ? <Component /> : null;
};

export default App;

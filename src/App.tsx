import { useMemo } from "react";
import { locations } from "@contentful/app-sdk";
import Field from "./locations/Field";
import Dialog from "./locations/Dialog";
import Sidebar from "./locations/Sidebar";
import { useSDK } from "@contentful/react-apps-toolkit";

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: null,
  [locations.LOCATION_ENTRY_FIELD]: Field,
  [locations.LOCATION_ENTRY_EDITOR]: null,
  [locations.LOCATION_DIALOG]: Dialog,
  [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
  [locations.LOCATION_PAGE]: null,
  [locations.LOCATION_HOME]: null,
};

const App = () => {
  const sdk = useSDK();

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(
      ComponentLocationSettings
    )) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? <Component /> : null;
};

export default App;

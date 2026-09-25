import { GlobalStyles } from "@contentful/f36-components";
import { SDKProvider } from "@contentful/react-apps-toolkit";

import { createRoot } from "react-dom/client";
import App from "./App";
import LocalhostWarning from "./components/LocalhostWarning";
import { SWRConfig } from "swr";
import { activateI18n } from "./config/i18n";

activateI18n();

const container = document.getElementById("root")!;
const root = createRoot(container);

if (process.env.NODE_ENV === "development" && window.self === window.top) {
  root.render(<LocalhostWarning />);
} else {
  root.render(
    <SDKProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          refreshWhenHidden: false,
          refreshWhenOffline: false,
        }}
      >
        <GlobalStyles />
        <App />
      </SWRConfig>
    </SDKProvider>,
  );
}

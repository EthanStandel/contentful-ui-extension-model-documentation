/**
 * Builds an absolute URL into the Contentful web app.
 *
 * The app runs in an iframe that is *not* served from the Contentful web app
 * origin (it's localhost in dev, and the app CDN once uploaded), so relative
 * hrefs resolve against the wrong host. `sdk.hostnames.webapp` is handed to us
 * over the SDK handshake and always names the web app the user is actually in,
 * including regional hosts like `app.eu.contentful.com`.
 *
 * `path` is relative to the current space and environment, so
 * `contentfulUrl(sdk, "content_types/foo")` yields
 * `https://app.contentful.com/spaces/<space>/environments/<env>/content_types/foo`.
 */
type ContentfulUrlSdk = {
  hostnames: { webapp: string };
  ids: {
    space: string;
    environment: string;
    /** Set when the user is browsing through an environment alias. */
    environmentAlias?: string;
  };
};

export const contentfulUrl = (sdk: ContentfulUrlSdk, path: string) => {
  // Prefer the alias so the link keeps the user in the context they're in.
  const environment = sdk.ids.environmentAlias ?? sdk.ids.environment;
  const base = `https://${sdk.hostnames.webapp}/spaces/${sdk.ids.space}/environments/${environment}`;
  return `${base}/${path.replace(/^\//, "")}`;
};

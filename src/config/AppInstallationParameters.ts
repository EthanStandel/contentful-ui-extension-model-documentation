export type AppInstallationParameters = {
  documentationLocale: string;
  extensionLabels: {
    documentation: string;
  };
};

export const getDefaultAppInstallationParameters =
  (): AppInstallationParameters => ({
    documentationLocale: "en-US",
    extensionLabels: {
      documentation: "Documentation",
    },
  });

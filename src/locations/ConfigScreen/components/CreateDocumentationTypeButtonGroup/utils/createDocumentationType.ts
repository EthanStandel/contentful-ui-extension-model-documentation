import { ConfigAppSDK } from "@contentful/app-sdk";
import { AppInstallationParameters } from "../../../../../config/AppInstallationParameters";

export const createDocumentationType = async (
  sdk: ConfigAppSDK,
  parameters: AppInstallationParameters.Type,
) => {
  const { documentationModel } = parameters;

  const contentType = await sdk.cma.contentType.createWithId(
    { contentTypeId: documentationModel.contentTypeId },
    {
      sys: { id: documentationModel.contentTypeId },
      name: documentationModel.label,
      displayField: documentationModel.fields.label.id,
      fields: [
        {
          ...documentationModel.fields.label,
          type: "Symbol",
          required: true,
        },
        {
          ...documentationModel.fields.type,
          type: "Symbol",
          required: true,
          validations: [{ unique: true }],
        },
        {
          ...documentationModel.fields.documentation,
          type: "RichText",
        },
      ],
    },
  );

  await sdk.cma.contentType.publish(
    { contentTypeId: contentType.sys.id },
    contentType,
  );
};

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

  // await makeFieldsReadonly(sdk, parameters, contentType);
};

// Contentful may have taken away the ability to do this, it no longer shows in the UI
// const READONLY_FIELDS = (parameters: AppInstallationParameters.Type) => [
//   parameters.documentationModel.fields.label.id,
//   parameters.documentationModel.fields.type.id,
// ];

// const makeFieldsReadonly = async (
//   sdk: ConfigAppSDK,
//   parameters: AppInstallationParameters.Type,
//   contentType: ContentTypeProps,
// ) => {
//   const editorInterface = await sdk.cma.editorInterface.get({
//     contentTypeId: contentType.sys.id,
//   });

//   const controls = [...(editorInterface.controls ?? [])];

//   READONLY_FIELDS(parameters).forEach((fieldId) => {
//     debugger;
//     const index = controls.findIndex((c) => c.fieldId === fieldId);

//     if (index === -1) {
//       controls.push({
//         fieldId,
//         widgetId: "singleLine",
//         settings: { readOnly: true },
//       });
//     } else {
//       controls[index] = {
//         ...controls[index],
//         settings: { ...(controls[index].settings ?? {}), readOnly: true },
//       };
//     }
//   });

//   await sdk.cma.editorInterface.update(
//     { contentTypeId: contentType.sys.id },
//     { ...editorInterface, controls },
//   );
// };

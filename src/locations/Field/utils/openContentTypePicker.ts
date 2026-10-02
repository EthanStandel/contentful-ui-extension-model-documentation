import type { FieldAppSDK } from "@contentful/app-sdk";
import type { InvocationData } from "~/hooks/useInvocationData";
import type { ContentTypePicker } from "~/locations/Dialog/components/ContentTypePicker";
import { translate } from "~/config/translate";

export const openContentTypePicker = (
  sdk: FieldAppSDK,
  data: Extract<InvocationData, { type: "picker-dialog" }>["data"],
): Promise<ContentTypePicker.Result | undefined> =>
  sdk.dialogs.openCurrent({
    title: translate("field.addContentMenu.addContent"),
    width: "fullWidth",
    minHeight: "calc(100vh - 170px)",
    position: "center",
    shouldCloseOnEscapePress: true,
    shouldCloseOnOverlayClick: true,
    parameters: { type: "picker-dialog", data } satisfies InvocationData,
  });

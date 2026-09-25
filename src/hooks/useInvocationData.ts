import type { DialogAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useMemo } from "react";
import z from "zod";

const InvocationValidators = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("picker-dialog"),
    data: z.object({
      linkableContentTypeIds: z.array(z.string()).nullable(),
      creatableContentTypeIds: z.array(z.string()),
      canLinkEntity: z.boolean(),
      isFull: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal("documentation-dialog"),
    data: z.object({
      contentTypeId: z.string(),
    }),
  }),
]);

export type InvocationData = z.infer<typeof InvocationValidators>;

export const useInvocationData = <
  Type extends InvocationData["type"] = InvocationData["type"],
>(
  type?: Type,
): Extract<InvocationData, { type: Type }> | null => {
  const sdk = useSDK<DialogAppSDK>();
  const { invocation } = sdk.parameters;

  return useMemo(() => {
    const parsed = InvocationValidators.safeParse(invocation).data;
    return parsed && (!type || parsed.type === type)
      ? (parsed as Extract<InvocationData, { type: Type }>)
      : null;
  }, [invocation, type]);
};

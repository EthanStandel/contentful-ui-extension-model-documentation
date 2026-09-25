import { i18n } from "@lingui/core";

const LOCALE = "en";

export const activateI18n = () =>
  i18n.loadAndActivate({ locale: LOCALE, messages: {} });

type Catalog = { readonly [key: string]: string | Catalog };

type Placeholders<Message extends string> =
  Message extends `${string}{${infer Placeholder}}${infer Rest}`
    ? Placeholder | Placeholders<Rest>
    : never;

type MessageKey<Messages, Prefix extends string = ""> = {
  [Key in keyof Messages & string]: Messages[Key] extends string
    ? `${Prefix}${Key}`
    : MessageKey<Messages[Key], `${Prefix}${Key}.`>;
}[keyof Messages & string];

type MessageAt<
  Key extends string,
  Messages,
> = Key extends `${infer Head}.${infer Rest}`
  ? Head extends keyof Messages
    ? MessageAt<Rest, Messages[Head]>
    : never
  : Key extends keyof Messages
    ? Messages[Key] extends string
      ? Messages[Key]
      : never
    : never;

export const createTranslate =
  <const Messages extends Catalog>(messages: Messages) =>
  <Key extends MessageKey<Messages> & string>(
    key: Key,
    ...values: [Placeholders<MessageAt<Key, Messages>>] extends [never]
      ? []
      : [Record<Placeholders<MessageAt<Key, Messages>>, string | number>]
  ) =>
    i18n.t(
      key.split(".").reduce<any>((branch, step) => branch[step], messages),
      values[0],
    );

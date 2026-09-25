import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { TestSdk } from "~/test/TestSdk";

vi.mock("@contentful/react-apps-toolkit", async () => ({
  ...(await vi.importActual<object>("@contentful/react-apps-toolkit")),
  useSDK: () => TestSdk.get(),
}));

const { MockField } = await import("~/test/MockField");

test("empty field offers a single add action", async () => {
  const screen = await render(MockField.render());

  await expect
    .element(screen.getByRole("button", { name: "Add content" }))
    .toBeVisible();
  await expect(screen.baseElement).toMatchScreenshot("empty");
});

test("opens the picker dialog with the field's linkable types", async () => {
  const opened: unknown[] = [];
  const screen = await render(MockField.render());
  (TestSdk.get() as any).dialogs.openCurrent = async (options: unknown) => {
    opened.push(options);
    return undefined;
  };

  await screen.getByRole("button", { name: "Add content" }).click();

  expect(opened).toHaveLength(1);
  expect((opened[0] as any).parameters).toMatchObject({
    type: "picker-dialog",
    data: {
      linkableContentTypeIds: ["primaryHero", "homepageHero", "fiftyFiftyHero"],
    },
  });
  expect((opened[0] as any).width).toBe("fullWidth");
});

import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { TestSdk } from "~/test/TestSdk";

vi.mock("@contentful/react-apps-toolkit", async () => ({
  ...(await vi.importActual<object>("@contentful/react-apps-toolkit")),
  useSDK: () => TestSdk.get(),
}));

const { MockField } = await import("~/test/MockField");

test("populated field", async () => {
  const screen = await render(
    MockField.render({ linkedEntryIds: ["entry-primary-hero"] }),
  );

  await expect.element(screen.getByText("Spring campaign hero")).toBeVisible();
  await expect(screen.baseElement).toMatchScreenshot("populated");
});

test("broken link", async () => {
  const screen = await render(MockField.render({ includeBrokenLink: true }));

  await expect
    .element(screen.getByText("Content missing or inaccessible"))
    .toBeVisible();
  await expect(screen.baseElement).toMatchScreenshot("broken-link");
});

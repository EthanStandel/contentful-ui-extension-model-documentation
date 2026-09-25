import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { TestSdk } from "~/test/TestSdk";

vi.mock("@contentful/react-apps-toolkit", async () => ({
  ...(await vi.importActual<object>("@contentful/react-apps-toolkit")),
  useSDK: () => TestSdk.get(),
}));

const { MockPicker } = await import("~/test/MockPicker");

test("selects the first content type by default", async () => {
  const screen = await render(MockPicker.render());

  await expect
    .element(screen.getByText(/large banner at the top/))
    .toBeVisible();
  await expect(screen.baseElement).toMatchScreenshot("picker-documented");
});

test("undocumented content type selected", async () => {
  const screen = await render(MockPicker.render());

  await screen.getByText("Homepage Hero").click();

  await expect
    .element(screen.getByText(/No documentation has been written/))
    .toBeVisible();
  await expect
    .element(screen.getByRole("button", { name: "Create documentation" }))
    .toBeVisible();
  await expect(screen.baseElement).toMatchScreenshot("picker-undocumented");
});

test("documentation exists but has not been published", async () => {
  const screen = await render(
    MockPicker.render({ publishedDocumentation: false }),
  );

  await expect
    .element(screen.getByText(/has not been published yet/))
    .toBeVisible();
  await expect(screen.baseElement).toMatchScreenshot("picker-unpublished");
});

test("returns a create intent when Create new entry is pressed", async () => {
  const results: unknown[] = [];
  const screen = await render(
    MockPicker.render({ onClose: (r) => results.push(r) }),
  );

  await screen.getByRole("button", { name: /Primary Hero$/ }).click();
  await screen.getByRole("button", { name: "Create new entry" }).click();

  expect(results).toEqual([{ action: "create", contentTypeId: "primaryHero" }]);
});

import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { TestSdk } from "~/test/TestSdk";

vi.mock("@contentful/react-apps-toolkit", async () => ({
  ...(await vi.importActual<object>("@contentful/react-apps-toolkit")),
  useSDK: () => TestSdk.get(),
}));

const { MockDocumentation } = await import("~/test/MockDocumentation");
const { TestFixtures } = await import("~/test/TestFixtures");

test("renders an iframe link as an embedded page", async () => {
  const screen = await render(
    MockDocumentation.render({
      entry: TestFixtures.embeddedPageDocumentationEntry,
    }),
  );

  await expect.element(screen.getByTitle("https://example.com/")).toBeVisible();
  await expect
    .poll(() => performance.getEntriesByName("https://example.com/").length)
    .toBeGreaterThan(0);
  await expect(screen.baseElement).toMatchScreenshot("embedded-page");
});

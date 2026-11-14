// Admin settings: the gear opens the goal and reset controls.
import { Page } from "@playwright/test";
import { checkIns, dayKey, expect, growData, pumpImage, test } from "../../fixtures";

const gear = (page: Page) => page.locator("button.icon-with-rounded-border");

const openSettings = async (page: Page) => {
  await gear(page).click();
  await expect(page.getByLabel("Set New Goal:")).toBeVisible();
};

test.describe("settings access", () => {
  test("players don't get the settings button", async ({ page, world }) => {
    await world.seed({ isAdmin: false });

    await world.open(page);

    await expect(gear(page)).toHaveCount(0);
  });

  test("admins open the settings and go back", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      assetData: growData({ goal: 30, overallTally: 8, dailyCheckIns: { [dayKey()]: checkIns("a", "b") } }),
    });
    await world.open(page);

    await openSettings(page);

    await expect(page.getByRole("heading", { name: "Overall Tally: 8" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daily Tally: 2" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Goal: 30" })).toBeVisible();
    await expect(page.getByLabel("Set New Goal:")).toHaveValue("30");
    await expect(page.getByRole("button", { name: "Help Me Grow!" })).toHaveCount(0);

    await gear(page).click();
    await expect(page.getByRole("button", { name: "Help Me Grow!" })).toBeVisible();
  });
});

test.describe("goal", () => {
  test("a new goal is saved and the balloon re-staged for everyone", async ({ page, world }) => {
    await world.seed({ isAdmin: true, assetData: growData({ goal: 100, overallTally: 10, imageSrc: pumpImage(2) }) });
    await world.open(page);
    await openSettings(page);

    await page.getByLabel("Set New Goal:").fill("40");
    await page.getByRole("button", { name: "Set Goal" }).click();

    await expect(page.getByRole("heading", { name: "Goal: 40" })).toBeVisible();
    expect((await world.assetData()).goal).toBe(40);
    expect(await world.events("set-webimage-layers")).toEqual([expect.objectContaining({ top: pumpImage(5) })]);
    expect(await world.events("analytics")).toContainEqual(
      expect.objectContaining({ analyticName: "new_configurations", uniqueKey: world.profileId }),
    );
  });

  test("the re-staged balloon is still shown after reopening", async ({ page, world }) => {
    test.fail(true, "EXP-444: PUT /goal changes the asset's image but not imageSrc in the data object");
    await world.seed({ isAdmin: true, assetData: growData({ goal: 100, overallTally: 10, imageSrc: pumpImage(2) }) });
    await world.open(page);
    await openSettings(page);
    await page.getByLabel("Set New Goal:").fill("40");
    await page.getByRole("button", { name: "Set Goal" }).click();
    await expect(page.getByRole("heading", { name: "Goal: 40" })).toBeVisible();

    await world.open(page);

    await expect(page.getByRole("img", { name: "Pump" })).toHaveAttribute("src", pumpImage(5));
    expect((await world.assetData()).imageSrc).toBe(pumpImage(5));
  });

  test("raising the goal after the balloon popped lets players check in again", async ({ page, world }) => {
    await world.seed({ isAdmin: true, assetData: growData({ goal: 10, overallTally: 10, imageSrc: pumpImage(19) }) });

    const response = await page.request.put(world.api("/goal"), { data: { goal: 20 } });
    expect(response.ok()).toBe(true);
    await world.open(page);
    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect(page.getByText("Overall Tally: 11")).toBeVisible();
    expect((await world.assetData()).overallTally).toBe(11);
  });

  for (const goal of [0, -5, "abc", null]) {
    test(`a goal of ${JSON.stringify(goal)} is rejected`, async ({ page, world }) => {
      test.fail(true, "EXP-444: PUT /goal saves any value parseInt returns, including 0, negatives and NaN");
      await world.seed({ isAdmin: true, assetData: growData({ goal: 50, overallTally: 20, imageSrc: pumpImage(8) }) });

      const response = await page.request.put(world.api("/goal"), { data: { goal } });

      expect(response.status()).toBe(400);
      expect((await world.assetData()).goal).toBe(50);
    });
  }

  test("clearing the goal field and saving doesn't wipe the balloon", async ({ page, world }) => {
    test.fail(true, "EXP-444: an empty goal saves 0, and the next open re-initializes the data object");
    const progress = growData({ goal: 50, overallTally: 20, imageSrc: pumpImage(8), dailyCheckIns: { [dayKey()]: checkIns("a") } });
    await world.seed({ isAdmin: true, assetData: progress });
    await world.open(page);
    await openSettings(page);

    await page.getByLabel("Set New Goal:").fill("");
    await page.getByRole("button", { name: "Set Goal" }).click();
    await expect(page.getByRole("button", { name: "Set Goal" })).toBeEnabled();
    await world.open(page);

    await expect(page.getByText("Overall Tally: 20")).toBeVisible({ timeout: 2_000 });
    expect(await world.assetData()).toMatchObject(progress);
  });
});

test.describe("reset", () => {
  test("asks first and changes nothing on No", async ({ page, world }) => {
    const progress = growData({ goal: 30, overallTally: 12, imageSrc: pumpImage(8), dailyCheckIns: { [dayKey()]: checkIns("a") } });
    await world.seed({ isAdmin: true, assetData: progress });
    await world.open(page);
    await openSettings(page);

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByRole("heading", { name: "Reset?" })).toBeVisible();
    await expect(page.getByText("All player data will be erased.")).toBeVisible();
    await page.getByRole("button", { name: "No" }).click();

    await expect(page.getByRole("heading", { name: "Reset?" })).toHaveCount(0);
    expect(await world.assetData()).toEqual(progress);
    expect(await world.events("set-webimage-layers")).toEqual([]);
  });

  test("Yes empties the balloon, clears check-ins and restores the default goal", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      assetData: growData({ goal: 30, overallTally: 12, imageSrc: pumpImage(8), dailyCheckIns: { [dayKey()]: checkIns(world.profileId, "a") } }),
    });
    await world.open(page);
    await openSettings(page);

    await page.getByRole("button", { name: "Reset" }).click();
    await page.getByRole("button", { name: "Yes" }).click();

    await expect(page.getByRole("heading", { name: "Overall Tally: 0" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Goal: 100" })).toBeVisible();
    expect(await world.assetData()).toEqual(growData());
    expect(await world.events("set-webimage-layers")).toEqual([expect.objectContaining({ top: pumpImage(0) })]);

    // Players who checked in today can check in again.
    await gear(page).click();
    await page.getByRole("button", { name: "Help Me Grow!" }).click();
    await expect(page.getByText("Overall Tally: 1")).toBeVisible();
  });
});

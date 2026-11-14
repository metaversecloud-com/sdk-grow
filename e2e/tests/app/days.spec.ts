// Day boundaries. The server keys check-ins by its local calendar day (UTC in the image); the drawer
// works out "today" again in the browser for the Daily Tally.
import { checkIns, dayKey, expect, growData, test } from "../../fixtures";

// A zone whose calendar day differs from UTC's right now: UTC+14 from 10:00 UTC, UTC-11 before 11:00 UTC.
const OTHER_DAY_ZONE = new Date().getUTCHours() >= 10 ? "Pacific/Kiritimati" : "Pacific/Pago_Pago";

test.describe(`a player in ${OTHER_DAY_ZONE}`, () => {
  test.use({ timezoneId: OTHER_DAY_ZONE });

  test("sees today's check-ins in the Daily Tally", async ({ page, world }) => {
    test.fail(true, "EXP-444: the drawer looks up today's check-ins by the browser's date, not the server's day key");
    await world.seed({ assetData: growData({ overallTally: 4, dailyCheckIns: { [dayKey()]: checkIns("a", "b", "c", "d") } }) });

    await world.open(page);

    await expect(page.getByText("Overall Tally: 4")).toBeVisible();
    await expect(page.getByText("Daily Tally: 4")).toBeVisible({ timeout: 2_000 });
  });

  test("sees their own check-in counted right after pressing the button", async ({ page, world }) => {
    test.fail(true, "EXP-444: the drawer looks up today's check-ins by the browser's date, not the server's day key");
    await world.seed({ assetData: growData() });
    await world.open(page);

    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect(page.getByText("Overall Tally: 1")).toBeVisible();
    await expect(page.getByText("Daily Tally: 1")).toBeVisible({ timeout: 2_000 });
  });
});

test("check-ins from two days ago don't count toward today", async ({ page, world }) => {
  await world.seed({
    assetData: growData({ overallTally: 9, dailyCheckIns: { [dayKey(2)]: checkIns("a", "b", "c", "d", "e", "f", "g", "h"), [dayKey(1)]: checkIns("a") } }),
  });

  await world.open(page);

  await expect(page.getByText("Overall Tally: 9")).toBeVisible();
  await expect(page.getByText("Daily Tally: 0")).toBeVisible();
});

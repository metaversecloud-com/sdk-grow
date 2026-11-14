// The daily check-in: one pump per player per day grows the shared balloon through 20 stages.
import { ASSET_POSITION, checkIns, dayKey, expect, growData, pumpImage, test } from "../../fixtures";

test.describe("first open", () => {
  test("sets up a new balloon and shows it", async ({ page, world }) => {
    await world.seed();

    await world.open(page);

    await expect(page.getByRole("heading", { name: "Grow" })).toBeVisible();
    await expect(page.getByText("Overall Tally: 0")).toBeVisible();
    await expect(page.getByText("Daily Tally: 0")).toBeVisible();
    await expect(page.getByText("Goal: 100")).toBeVisible();
    await expect(page.getByRole("img", { name: "Pump" })).toHaveAttribute("src", pumpImage(0));
    expect(await world.assetData()).toMatchObject(growData());
    await expect.poll(() => world.events("analytics")).toEqual([
      expect.objectContaining({ analyticName: "starts", uniqueKey: world.profileId }),
    ]);
  });

  test("shows a balloon in progress as stored", async ({ page, world }) => {
    await world.seed({
      assetData: growData({ goal: 40, overallTally: 12, imageSrc: pumpImage(6), dailyCheckIns: { [dayKey()]: checkIns("a", "b", "c") } }),
    });

    await world.open(page);

    await expect(page.getByText("Overall Tally: 12")).toBeVisible();
    await expect(page.getByText("Daily Tally: 3")).toBeVisible();
    await expect(page.getByText("Goal: 40")).toBeVisible();
    await expect(page.getByRole("img", { name: "Pump" })).toHaveAttribute("src", pumpImage(6));
    // Opening the drawer changes nothing.
    expect((await world.assetData()).overallTally).toBe(12);
  });
});

test.describe("checking in", () => {
  test("pumps the balloon once and records who checked in today", async ({ page, world }) => {
    await world.seed({ assetData: growData({ goal: 10, overallTally: 4, imageSrc: pumpImage(8) }) });
    await world.open(page);

    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect(page.getByText("Overall Tally: 5")).toBeVisible();
    await expect(page.getByText("Daily Tally: 1")).toBeVisible();
    await expect(page.getByRole("img", { name: "Pump" })).toHaveAttribute("src", pumpImage(10));
    const data = await world.assetData();
    expect(data).toMatchObject({ goal: 10, overallTally: 5, imageSrc: pumpImage(10) });
    expect(data.dailyCheckIns).toEqual({ [dayKey()]: { total: 1, users: { [world.profileId]: expect.any(String) } } });
    expect(Date.now() - Date.parse(data.dailyCheckIns[dayKey()].users[world.profileId])).toBeLessThan(60_000);
    // Everyone in the world sees the bigger balloon on the dropped asset.
    expect(await world.events("set-webimage-layers")).toEqual([expect.objectContaining({ bottom: "", top: pumpImage(10) })]);
    await expect.poll(() => world.events("fire-toast")).toEqual([expect.objectContaining({ title: "Successfully Checked In" })]);
    await expect.poll(() => world.events("particles")).toEqual([
      expect.objectContaining({ particleName: "balloon_float", position: ASSET_POSITION, duration: 3 }),
    ]);
    expect((await world.events("analytics")).map((a) => a.analyticName)).toEqual(["starts", "completions"]);
    expect(await world.events("analytics")).toContainEqual(expect.objectContaining({ analyticName: "completions", uniqueKey: world.profileId }));
  });

  test("a second check-in the same day is refused", async ({ page, world }) => {
    await world.seed({ assetData: growData({ overallTally: 7, dailyCheckIns: { [dayKey()]: checkIns(world.profileId) } }) });
    await world.open(page);
    const before = await world.assetData();

    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect.poll(() => world.events("fire-toast")).toEqual([expect.objectContaining({ title: "Already Checked In" })]);
    await expect(page.getByText("Overall Tally: 7")).toBeVisible();
    expect(await world.assetData()).toEqual(before);
    expect(await world.events("particles")).toEqual([]);
    expect(await world.events("set-webimage-layers")).toEqual([]);
  });

  test("checking in yesterday doesn't block today", async ({ page, world }) => {
    await world.seed({
      assetData: growData({ overallTally: 3, dailyCheckIns: { [dayKey(1)]: checkIns(world.profileId, "other-1", "other-2") } }),
    });
    await world.open(page);
    await expect(page.getByText("Daily Tally: 0")).toBeVisible();

    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect(page.getByText("Overall Tally: 4")).toBeVisible();
    await expect(page.getByText("Daily Tally: 1")).toBeVisible();
    const { dailyCheckIns } = await world.assetData();
    expect(dailyCheckIns[dayKey()]).toEqual({ total: 1, users: { [world.profileId]: expect.any(String) } });
    // Yesterday's record stays.
    expect(dailyCheckIns[dayKey(1)].total).toBe(3);
  });

  test("other players' check-ins today add to the daily total", async ({ page, world }) => {
    await world.seed({ assetData: growData({ overallTally: 2, dailyCheckIns: { [dayKey()]: checkIns("other-1", "other-2") } }) });
    await world.open(page);
    await expect(page.getByText("Daily Tally: 2")).toBeVisible();

    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect(page.getByText("Daily Tally: 3")).toBeVisible();
    expect((await world.assetData()).dailyCheckIns[dayKey()]).toEqual({
      total: 3,
      users: { "other-1": expect.any(String), "other-2": expect.any(String), [world.profileId]: expect.any(String) },
    });
  });
});

test.describe("balloon stages", () => {
  // stage = min(19, floor(tally / goal * 20)), after this check-in.
  const cases = [
    { goal: 100, tally: 0, stage: 0 },
    { goal: 100, tally: 4, stage: 1 },
    { goal: 20, tally: 9, stage: 10 },
    { goal: 3, tally: 1, stage: 13 },
    { goal: 40, tally: 38, stage: 19 },
  ];
  for (const { goal, tally, stage } of cases) {
    test(`check-in ${tally + 1} of ${goal} shows stage ${stage}`, async ({ page, world }) => {
      await world.seed({ assetData: growData({ goal, overallTally: tally }) });

      const response = await page.request.get(world.api("/check-in"));

      expect((await response.json()).gameState).toMatchObject({ overallTally: tally + 1, imageSrc: pumpImage(stage) });
      expect(await world.events("set-webimage-layers")).toEqual([expect.objectContaining({ top: pumpImage(stage) })]);
    });
  }
});

test.describe("reaching the goal", () => {
  test("the check-in that reaches the goal pops the balloon and logs goal_reached", async ({ page, world }) => {
    await world.seed({ assetData: growData({ goal: 5, overallTally: 4, imageSrc: pumpImage(16) }) });
    await world.open(page);

    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect(page.getByText("Overall Tally: 5")).toBeVisible();
    await expect(page.getByRole("img", { name: "Pump" })).toHaveAttribute("src", pumpImage(19));
    expect((await world.events("analytics")).map((a) => a.analyticName)).toEqual(["starts", "completions", "goal_reached"]);
  });

  test("once the goal is met nobody can check in", async ({ page, world }) => {
    await world.seed({ assetData: growData({ goal: 5, overallTally: 5, imageSrc: pumpImage(19) }) });
    await world.open(page);
    const before = await world.assetData();

    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect.poll(() => world.events("fire-toast")).toEqual([expect.objectContaining({ title: "Already met goal" })]);
    await expect(page.getByText("Overall Tally: 5")).toBeVisible();
    expect(await world.assetData()).toEqual(before);
    expect((await world.events("analytics")).map((a) => a.analyticName)).toEqual(["starts"]);
  });
});

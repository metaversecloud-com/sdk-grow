// Permission checks and anti-cheat: what a player can do by calling the API directly.
import { checkIns, dayKey, expect, growData, pumpImage, test } from "../../fixtures";

test.describe("admin endpoints reject players", () => {
  const calls = [
    { name: "change the goal", path: "/goal", data: { goal: 1 } },
    { name: "reset the balloon", path: "/reset" },
  ];

  for (const call of calls) {
    test(call.name, async ({ page, world }) => {
      test.fail(true, "EXP-444: /goal and /reset have no server-side admin check");
      await world.seed({
        isAdmin: false,
        assetData: growData({ goal: 50, overallTally: 20, imageSrc: pumpImage(8), dailyCheckIns: { [dayKey()]: checkIns("a") } }),
      });
      const before = await world.assetData();

      const response = await page.request.put(world.api(call.path), { data: call.data });

      expect(response.status()).toBe(403);
      expect(await world.assetData()).toEqual(before);
      expect(await world.events("set-webimage-layers")).toEqual([]);
    });
  }

  test("admins can still call them", async ({ page, world }) => {
    await world.seed({ isAdmin: true, assetData: growData({ goal: 50, overallTally: 20 }) });

    expect((await page.request.put(world.api("/goal"), { data: { goal: 60 } })).ok()).toBe(true);
    expect((await world.assetData()).goal).toBe(60);
    expect((await page.request.put(world.api("/reset"))).ok()).toBe(true);
    expect(await world.assetData()).toEqual(growData());
  });
});

test.describe("one check-in per player per day", () => {
  test("a player can't check in again by sending a made-up profileId", async ({ page, world }) => {
    test.fail(true, "EXP-444: the daily limit is keyed by the client-sent profileId, not the visitor's real profile");
    await world.seed({ assetData: growData({ goal: 100 }) });

    for (let i = 0; i < 5; i++) {
      await page.request.get(world.api("/check-in", { profileId: `made-up-${i}` }));
    }

    expect((await world.assetData()).overallTally).toBe(1);
  });

  test("checking in many times at once counts once", async ({ page, world }) => {
    test.fail(true, "EXP-444: check-in reads the tally and writes it back without a lock, so parallel requests all succeed");
    await world.seed({ assetData: growData({ goal: 100 }), latencyMs: 50 });

    await Promise.all(Array.from({ length: 5 }, () => page.request.get(world.api("/check-in"))));

    expect((await world.assetData()).overallTally).toBe(1);
    await expect.poll(async () => (await world.events("fire-toast")).filter((t) => t.title === "Successfully Checked In")).toHaveLength(1);
    expect(await world.events("particles")).toHaveLength(1);
  });
});

test.describe("players checking in at the same time", () => {
  test("every check-in counts toward the balloon", async ({ page, world }) => {
    test.fail(true, "EXP-444: check-in writes overallTally and the daily total computed from a stale read, so simultaneous check-ins overwrite each other");
    const players = Array.from({ length: 6 }, (_, i) => 100 + i);
    await world.seed({ assetData: growData({ goal: 100 }), otherVisitors: Object.fromEntries(players.map((id) => [id, {}])), latencyMs: 50 });

    const responses = await Promise.all(players.map((id) => page.request.get(world.api("/check-in", world.as(id)))));

    expect(responses.every((r) => r.ok())).toBe(true);
    const data = await world.assetData();
    expect(Object.keys(data.dailyCheckIns[dayKey()].users)).toHaveLength(6);
    expect(data.overallTally).toBe(6);
    expect(data.dailyCheckIns[dayKey()].total).toBe(6);
  });

  test("the goal can't be overshot by the last check-ins arriving together", async ({ page, world }) => {
    test.fail(true, "EXP-444: check-in reads the tally and writes it back without a lock, so the goal check uses a stale tally");
    const players = Array.from({ length: 4 }, (_, i) => 100 + i);
    await world.seed({ assetData: growData({ goal: 10, overallTally: 9, imageSrc: pumpImage(18) }), otherVisitors: Object.fromEntries(players.map((id) => [id, {}])), latencyMs: 50 });

    await Promise.all(players.map((id) => page.request.get(world.api("/check-in", world.as(id)))));

    // Exactly one player gets the last pump; the others are told the goal is met.
    expect((await world.assetData()).overallTally).toBe(10);
    expect(Object.keys((await world.assetData()).dailyCheckIns[dayKey()].users)).toHaveLength(1);
    expect((await world.events("analytics")).filter((a) => a.analyticName === "goal_reached")).toHaveLength(1);
  });

  test("players opening a new balloon at the same time all get it set up", async ({ page, world }) => {
    const players = Array.from({ length: 4 }, (_, i) => 100 + i);
    await world.seed({ otherVisitors: Object.fromEntries(players.map((id) => [id, {}])), latencyMs: 30 });

    const responses = await Promise.all(players.map((id) => page.request.get(world.api("/game-state", world.as(id)))));

    for (const response of responses) {
      expect(response.ok()).toBe(true);
      expect((await response.json()).gameState).toMatchObject({ goal: 100, overallTally: 0, imageSrc: pumpImage(0) });
    }
    expect(await world.assetData()).toMatchObject(growData());
  });
});

test.describe("dropped asset", () => {
  test("an app opened from a removed asset shows an error", async ({ page, world }) => {
    await world.seed({ withAsset: false });

    await page.goto(world.url("/"));

    await expect(page.locator(".text-error")).toContainText("Error");
    await expect(page.getByRole("img", { name: "Pump" })).toHaveAttribute("src", pumpImage(0));
  });

  test("checking in on an asset removed after opening fails without writing anything", async ({ page, world }) => {
    await world.seed({ assetData: growData({ overallTally: 3 }) });
    await world.open(page);
    // The balloon is removed from the world while the drawer is open.
    await world.seed({ withAsset: false });

    await page.getByRole("button", { name: "Help Me Grow!" }).click();

    await expect(page.locator(".text-error")).toContainText("Error");
    expect(await world.events("particles")).toEqual([]);
    expect(await world.events("fire-toast")).toEqual([]);
  });

  test("the error says the asset is gone", async ({ page, world }) => {
    test.fail(true, "EXP-444: getDroppedAsset returns { error } instead of throwing, so the real cause is lost and the reply is a 500 with error: {}");
    await world.seed({ withAsset: false });

    const response = await page.request.get(world.api("/game-state"));

    expect(response.status()).toBe(404);
    expect(JSON.stringify(await response.json())).toMatch(/not found/i);
  });
});

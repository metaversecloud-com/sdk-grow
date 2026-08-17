import express from "express";
import { handleCheckIn, handleGetGameState, handleUpdateGoal, handleReset } from "./controllers/index.js";
import { getVersion } from "./utils/getVersion.js";

const router = express.Router();
const SERVER_START_DATE = new Date();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    serverStartDate: SERVER_START_DATE,
    envs: {
      COMMIT_HASH: process.env.COMMIT_HASH ?? "NOT SET",
      BUILD_TIME: process.env.BUILD_TIME ?? "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      S3_BUCKET: process.env.S3_BUCKET,
    },
  });
});

router.get("/game-state", handleGetGameState);

router.get("/check-in", handleCheckIn);

router.put("/goal", handleUpdateGoal);

router.put("/reset", handleReset);

export default router;

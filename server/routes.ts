import express from "express";
import {
  handleDropAsset,
  handleGetDroppedAsset,
  handleGetVisitor,
  handleRemoveDroppedAssetsByUniqueName,
  handleGetWorldDetails,
  handleUpdateWorldDataObject,
  handleCheckIn,
  handleFireToast,
  handleGetCheckInInfo,
  handleParticleEffects,
  AdminReset,
  AdminResetTally,
} from "./controllers/index.js";
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
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      S3_BUCKET: process.env.S3_BUCKET,
    },
  });
});

// Dropped Assets
router.post("/dropped-asset", handleDropAsset);
router.get("/dropped-asset", handleGetDroppedAsset);
router.post("/remove-dropped-assets", handleRemoveDroppedAssetsByUniqueName);

// Visitor
router.get("/visitor", handleGetVisitor);

// World
router.get("/world", handleGetWorldDetails);
router.put("/world/data-object", handleUpdateWorldDataObject);
router.put("/world/fire-toast", handleFireToast);

//checking in
router.get("/check-in", handleCheckIn);
router.get("/check-in-info", handleGetCheckInInfo);

//particle effects
router.post("/particle-effects", handleParticleEffects);

//resetting goal for admin while keeping overall tally
router.put("/admin-reset", AdminReset); 

//resetting tally for admin while maintaining goal
router.put("/admin-reset-tally", AdminResetTally);



export default router;

import { Request, Response } from "express";
import {
  World,
  errorHandler,
  getCredentials,
  getDroppedAsset,
  getImageSrc,
  getStage,
  getToday,
} from "../utils/index.js";
import { IDroppedAsset } from "../types/DroppedAssetInterface.js";

export const handleCheckIn = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const profileId = credentials.profileId;

    const world = World.create(credentials.urlSlug, { credentials });

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const { dailyCheckIns, goal, overallTally = 0, imageSrc } = droppedAsset.dataObject;

    //checking if any user has checked in today
    const todayKey = getToday();
    const todayEntry = dailyCheckIns?.[todayKey] || {
      total: 0,
      users: {},
    };

    let newOverallTally = overallTally,
      newImageSrc = imageSrc;

    if (todayEntry.users[profileId]) {
      //if users is in date mapping (already checked in), return already checked in json message
      await world
        .fireToast({
          title: "Already Checked In",
          text: "You are already checked in. Please come back tomorrow!",
        })
        .catch((error) =>
          errorHandler({
            error,
            functionName: "handleCheckIn",
            message: "Error firing toast",
          }),
        );
    } else if (overallTally >= goal) {
      //unable to check in - goal already met/balloon already popped
      //firing toast for meeting goal
      await world
        .fireToast({
          title: "Already met goal",
          text: "You have already met the goal!",
        })
        .catch((error) =>
          errorHandler({
            error,
            functionName: "handleCheckIn",
            message: "Error firing toast",
          }),
        );
    } else {
      //adding 1 to overall tally
      newOverallTally = overallTally + 1;

      //using updateWebImageLayers to update the image layer
      const stage = getStage(newOverallTally, goal);
      newImageSrc = getImageSrc(stage);
      await droppedAsset.updateWebImageLayers("", newImageSrc);

      const updates = {
        [`dailyCheckIns.${todayKey}.total`]: todayEntry.total + 1,
        // Optionally store the timestamp for each user
        [`dailyCheckIns.${todayKey}.users.${profileId}`]: new Date().toISOString(),
        overallTally: newOverallTally,
        imageSrc: newImageSrc,
      };

      await droppedAsset.updateDataObject(updates);

      //firing toast for successful check in
      world
        .fireToast({
          title: "Successfully Checked In",
          text: "You have successfully checked in! Please come back tomorrow!",
        })
        .catch((error) =>
          errorHandler({
            error,
            functionName: "handleCheckIn",
            message: "Error firing toast",
          }),
        );

      world
        .triggerParticle({
          name: "Flame",
          duration: 3,
          position: { x: droppedAsset.position.x, y: droppedAsset.position.y },
        })
        .catch((error) =>
          errorHandler({
            error,
            functionName: "handleParticleEffects",
            message: "Error triggering particle effects",
          }),
        );
    }

    await droppedAsset.fetchDataObject();

    return res.json({
      success: true,
      gameState: droppedAsset.dataObject,
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDroppedAssetDetails",
      message: "Error getting dropped asset instance and data object",
      req,
      res,
    });
  }
};

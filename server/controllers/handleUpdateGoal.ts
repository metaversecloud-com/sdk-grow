import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, getImageSrc, getStage } from "../utils/index.js";
import { IDroppedAsset } from "../types/DroppedAssetInterface.js";

export const handleUpdateGoal = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId } = credentials;

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const { dailyCheckIns, overallTally } = droppedAsset.dataObject;

    const newGoal = parseInt(req.body.goal as string);

    await droppedAsset.updateDataObject(
      { goal: newGoal },
      {
        analytics: [
          {
            analyticName: "new_configurations",
            uniqueKey: profileId,
          },
        ],
      },
    );

    const stage = getStage(overallTally || 0, newGoal);
    const newImageSrc = getImageSrc(stage);
    await droppedAsset.updateWebImageLayers("", newImageSrc);

    await droppedAsset.fetchDataObject();

    return res.json({
      success: true,
      gameState: {
        dailyCheckIns,
        goal: newGoal,
        overallTally,
        imageSrc: newImageSrc,
      },
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDroppedAssetDetails",
      message: "Error getting dropped asset instance and data object in AdminReset",
      req,
      res,
    });
  }
};

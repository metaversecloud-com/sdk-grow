import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, getStage } from "../utils/index.js";
import { IDroppedAsset } from "../types/DroppedAssetInterface.js";

export const handleReset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const newImageSrc = "https://sdk-grow.s3.us-east-1.amazonaws.com/Pump-0.png";
    await droppedAsset.updateWebImageLayers("", newImageSrc);

    //resetting the tally and getting rid of daily records
    const updates = {
      dailyCheckIns: {},
      overallTally: 0,
      goal: 100,
      imageSrc: newImageSrc,
    };

    await droppedAsset.updateDataObject(updates);

    await droppedAsset.fetchDataObject();

    const { dailyCheckIns, goal, overallTally, imageSrc } = droppedAsset.dataObject;

    //returning success response with tally reset
    return res.json({
      success: true,
      gameState: {
        dailyCheckIns,
        goal,
        overallTally,
        imageSrc,
      },
    });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleReset",
      message: "Error resetting data object",
      req,
      res,
    });
  }
};

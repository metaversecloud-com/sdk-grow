import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, getImageSrc, Visitor } from "../utils/index.js";
import { IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { VisitorInterface } from "@rtsdk/topia";

// getting check in total to display when loading app
export const handleGetGameState = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { profileId, visitorId, urlSlug } = credentials;

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const { dailyCheckIns, goal, overallTally, imageSrc = getImageSrc() } = droppedAsset.dataObject;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    visitor.updateDataObject(
      {},
      {
        analytics: [{ analyticName: "starts", uniqueKey: profileId }],
      },
    );

    return res.json({
      success: true,
      message: "Received check in info successfully!",
      gameState: {
        dailyCheckIns,
        goal,
        overallTally,
        imageSrc,
      },
      visitor: { isAdmin: visitor.isAdmin },
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

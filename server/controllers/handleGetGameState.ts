import { Request, Response } from "express";
import { errorHandler, getCredentials, getDroppedAsset, Visitor } from "../utils/index.js";
import { IDroppedAsset } from "../types/DroppedAssetInterface.js";
import { VisitorInterface } from "@rtsdk/topia";

// getting check in total to display when loading app
export const handleGetGameState = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { visitorId, urlSlug } = credentials;

    const droppedAsset: IDroppedAsset = await getDroppedAsset(credentials);

    const { dailyCheckIns, goal, overallTally, imageSrc } = droppedAsset.dataObject;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

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

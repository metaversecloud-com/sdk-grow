import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, initializeDefaultCheckInObject, initializeDroppedAssetDataObject } from "../../utils/index.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";
import { AssetFactory } from "@rtsdk/topia";
import { CheckInAsset } from "../../types/CheckInDataObject.js";

export const handleAssetImageLayer = async (req: Request, res: Response) => {
  try {
    
    const credentials = getCredentials(req.query);
    //console.log("Credentials: ", credentials);
    //console.log("HANDLING ASSET IMAGE...");
    const { assetId, urlSlug } = credentials;
    const{stage} = req.body;
    //console.log("Stage: ", stage);

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    
    console.log("Dropped Asset: ", droppedAsset);

    const balloonImage = `https://sdk-grow.s3.us-east-1.amazonaws.com/Pump-${stage}.png`;

    //specialType of asset is webImage

    // If the application will make any updates to a dropped asset's data object we need to
    // first instantiate to ensure it's existence and define it's proper structure.
    // The same should be true for World, User, and Visitor data objects
    await initializeDefaultCheckInObject(droppedAsset as CheckInAsset);

    await droppedAsset.updateWebImageLayers("",balloonImage);


    //returning success response
    return res.json({ droppedAsset, success: true, message: "Updated asset image layer successfully!" });
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

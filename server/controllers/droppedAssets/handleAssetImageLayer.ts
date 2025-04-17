import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, initializeDroppedAssetDataObject } from "../../utils/index.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";
import { AssetFactory } from "@rtsdk/topia";

export const handleAssetImageLayer = async (req: Request, res: Response) => {
  try {
    
    // https://raw.githubusercontent.com/calebhollander/Balloon-Assets/blob/main/Pump-0.png
    const credentials = getCredentials(req.query);
    //console.log("Credentials: ", credentials);
    console.log("HANDLING ASSET IMAGE...");
    const { assetId, urlSlug } = credentials;
    const{stage} = req.body;
    console.log("Stage: ", stage);

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    
    
    console.log("Dropped Asset: ", droppedAsset);

    const balloonImage = `https://calebhollander.github.io/Balloon-Assets/Pump-${stage}.png`;

    /*
    await droppedAsset.updateAsset({
        assetName: `Balloon_Pump`,
        creatorTags: {},
        //maybe change isPublic to false
        isPublic: true,
        tagJson: "{}",
        topLayerURL: balloonImage,
        shouldUploadImages: false,
        bottomLayerURL: undefined,
    })
    */

    const updateParams: any = {
      assetName: `Balloon_Pump_Stage_${stage}`,
      creatorTags: {},
      isPublic: true,
      tagJson: "{}",
      topLayerURL: balloonImage,
      shouldUploadImages: false,
    };


    // If the application will make any updates to a dropped asset's data object we need to
    // first instantiate to ensure it's existence and define it's proper structure.
    // The same should be true for World, User, and Visitor data objects
    await initializeDroppedAssetDataObject(droppedAsset as IDroppedAsset);

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

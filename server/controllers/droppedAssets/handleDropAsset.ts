import { Request, Response } from "express";
import { Asset, DroppedAsset, errorHandler, getCredentials } from "../../utils/index.js";

export const handleDropAsset = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);

    const {
      assetId,
      isInteractive,
      position,
      uniqueName,
    }: { assetId: string; isInteractive: boolean; position: { x: number; y: number }; uniqueName: string } = req.body;

    const asset = Asset.create(assetId, { credentials });

    const droppedAsset = await DroppedAsset.drop(asset, {
      isInteractive,
      interactivePublicKey: process.env.INTERACTIVE_KEY,
      position,
      uniqueName,
      urlSlug: credentials.urlSlug,
    });
    console.log("Dropped Asset: ", droppedAsset);

    /*
    const keyAsset = await droppedAsset.setDataObject({
     
      keyAssetId: droppedAsset.id,

    })
    */

    //console.log("Dropped Asset Data Object: ", droppedAsset);

    //return res.json({"Dropped Asset": droppedAsset, "Key Asset Data Object": keyAsset, success: true });
    return res.json({droppedAsset, success: true });
    //return res.json({ keyAsset, success: true });

  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleDropAsset",
      message: "Error dropping asset",
      req,
      res,
    });
  }
};

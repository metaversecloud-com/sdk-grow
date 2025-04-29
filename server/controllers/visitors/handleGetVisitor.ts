import { errorHandler, getVisitor, getCredentials } from "../../utils/index.js";
import { Request, Response } from "express";

export const handleGetVisitor = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId } = credentials;
    console.log("ASSET ID from handleGetVisitor: ", assetId);

    const visitor = await getVisitor(credentials);
    console.log("VISITOR: ", visitor);
    const { isAdmin, landmarkZonesString, privateZoneId, profileId } = visitor;

    let isInZone = false;
    const landmarkZonesArray = landmarkZonesString.split(",");
    if (landmarkZonesArray.includes(assetId) || privateZoneId === assetId) isInZone = true;

    return res.json({ visitor: { isAdmin, isInZone, profileId }, success: true });
  } catch (error) {
    console.log("ERROR IN HANDLEGETVISITOR: ",error);
    return errorHandler({ error, functionName: "handleGetVisitor", message: "Error getting visitor", req, res });
  }
};

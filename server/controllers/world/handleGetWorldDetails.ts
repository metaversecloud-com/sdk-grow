import { Request, Response } from "express";
import { World, errorHandler, getCredentials } from "../../utils/index.js";

export const handleGetWorldDetails = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { includeDataObject } = req.body;
    console.log("REQUEST BODY: ", req.body);
    console.log("REQUEST QUERY:", req.query);

    const world = World.create(credentials.urlSlug, { credentials });
    await world.fetchDetails();
    await world.triggerParticle({ name: "Flame", duration: 10000, position: { x: 0, y: 0 } });
    console.log("GETTING WORLD DETAILS...");
    if (includeDataObject) await world.fetchDataObject();

    return res.json({ world, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getWorldDetails",
      message: "Error getting world details",
      req,
      res,
    });
  }
};

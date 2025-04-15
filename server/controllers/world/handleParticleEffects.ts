import { Request, Response } from "express";
import { World, errorHandler, getCredentials } from "../../utils/index.js";

export const handleParticleEffects = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    console.log("REQ QUERY: ", req.query);

    //getting position to fire particle effects
    const position = req.query.position;

    const { includeDataObject } = req.body;
    const x = parseFloat((req.query as any).params?.x) || 0;
    const y = parseFloat((req.query as any).params?.y) || 0;

    console.log("Received position from client:", { x, y });

    const world = World.create(credentials.urlSlug, { credentials });
    await world.fetchDetails();
    await world.triggerParticle({ name: "Flame", duration: 10000, position: { x: x, y: y } });
    if (includeDataObject) await world.fetchDataObject();

    return res.json({ world, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleParticleEffects",
      message: "Error getting particle effects",
      req,
      res,
    });
  }
};

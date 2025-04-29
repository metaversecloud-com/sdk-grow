import { Request, Response } from "express";
import { World, errorHandler, getCredentials } from "../../utils/index.js";


//would it make more sense for me to do it in the check in route and get x and y position from that request? I thought that may be too much code in one function
export const handleParticleEffects = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    //getting position to fire particle effects
    const position = req.query.position;

    const { includeDataObject } = req.body;
    const x = parseFloat((req.query as any).params?.x) || 0;
    const y = parseFloat((req.query as any).params?.y) || 0;


    //do I need to create a world every time I call world-related functions?
    const world = World.create(credentials.urlSlug, { credentials });
   
    await world.fetchDetails();
    //duration is in seconds
    await world.triggerParticle({ name: "Flame", duration: 3, position: { x: x, y: y } });
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

import { Visitor } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
import { Credentials } from "../../types/Credentials.js";

export const getVisitor = async (credentials: Credentials) => {
  try {
    const { interactivePublicKey, interactiveNonce, urlSlug, visitorId } = credentials;

    const visitor = await Visitor.get(visitorId, urlSlug, {
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
    });

<<<<<<< HEAD
=======
    /*
    await visitor.moveVisitor({
      shouldTeleportVisitor: true,
      x: 100,
      y: 100,
    });
    */

>>>>>>> main
    if (!visitor) throw "Not in world";

    return visitor;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getVisitor",
      message: "Error getting visitor",
    });
  }
};

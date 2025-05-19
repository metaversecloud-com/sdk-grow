import { errorHandler } from "../errorHandler.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";
import { getImageSrc } from "../getImageSrc.js";

export const initializeDroppedAssetDataObject = async (droppedAsset: IDroppedAsset) => {
  try {
    //checking if a tally has been set
    if (!droppedAsset?.dataObject?.goal) {
      // adding a lockId and releaseLock will prevent race conditions and ensure the data object is being updated only once until either the time has passed or the operation is complete
      const lockId = `${droppedAsset.id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      //setting with default values
      await droppedAsset.setDataObject(
        {
          lock: { lockId },
          overallTally: 0,
          goal: 100,
          dailyCheckIns: {},
          imageSrc: getImageSrc(),
        },
        { lock: { lockId, releaseLock: true } },
      );
    }
    return;
  } catch (error) {
    errorHandler({
      error,
      functionName: "initializeDroppedAssetDataObject",
      message: "Error initializing dropped asset data object",
    });
    return await droppedAsset.fetchDataObject();
  }
};

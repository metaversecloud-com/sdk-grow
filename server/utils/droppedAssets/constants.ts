import { CheckInAsset } from "../../types/CheckInDataObject.js";
import { errorHandler } from "../errorHandler.js";

export const initializeDefaultCheckInObject = async (droppedAsset: CheckInAsset) => {
  try {
    await droppedAsset.fetchDataObject();

    //checking if a tally has been set
    if (droppedAsset.dataObject?.overallTally === undefined) {
      // adding a lockId and releaseLock will prevent race conditions and ensure the data object is being updated only once until either the time has passed or the operation is complete
      const lockId = `${droppedAsset.id}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      //setting with default values
      await droppedAsset.setDataObject({
        count: 0,
        lock: { lockId },
        overallTally: 0,
        goal: 100,
        shouldReset: false,
        isPopped: false,
        dailyCheckIns: {}
      });
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

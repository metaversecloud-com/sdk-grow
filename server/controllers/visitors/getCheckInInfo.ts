import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, initializeDroppedAssetDataObject } from "../../utils/index.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";
import { getTodayKey } from "./handleCheckIn.js";
import {CheckInAsset} from "../../types/CheckInDataObject.js";

import {initializeDefaultCheckInObject} from "../../utils/droppedAssets/constants.js";

//getting check in total to display when loading app
 export const handleGetCheckInInfo = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const profileId = credentials.profileId;
 
    const { assetId, urlSlug } = credentials;
    
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials }) as CheckInAsset;
   
    
    await droppedAsset.fetchDataObject();

    
    //checking if the data object exists - if not, initialize it with default values
    await initializeDefaultCheckInObject(droppedAsset as CheckInAsset);



    //getting the data object and casting to CheckInAsset data object
    const dataObject = droppedAsset.dataObject as CheckInAsset["dataObject"];
    
    //checking if the data object is undefined
    if (!dataObject) {
        //droppedAsset.dataObject = {} as CheckInDataObject;
        throw new Error("Data object is undefined");
    }



    const overallTally = dataObject.overallTally;

    const goal = dataObject.goal;
    
    const isPopped = overallTally >= goal;

    //checking if any user has checked in today
    const todayKey = getTodayKey();
    const todayEntry = dataObject?.dailyCheckIns?.[todayKey] || {
      total: 0,
      users: {},
      //isPopped: isPopped,
    };

    const receivedTotal = todayEntry.total;
    
    //checking user in with current date

    // If the application will make any updates to a dropped asset's data object we need to
    // first instantiate to ensure it's existence and define it's proper structure.
    // The same should be true for World, User, and Visitor data objects

    
    //returning the updated data object or the default data object
    return res.json({
        success: true,
        message: "Received check in info successfully!",
        tally: receivedTotal,
        goalToPop: goal,
        overallTally: overallTally,
        isPopped: isPopped,
        droppedAsset,
      });

   


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
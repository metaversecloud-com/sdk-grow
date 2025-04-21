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
    //console.log("Profile ID: ", profileId);
    //console.log("Credentials: ", credentials);
    const { assetId, urlSlug } = credentials;
    
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials }) as CheckInAsset;
    //console.log("Dropped Asset: ", droppedAsset);

    
    await droppedAsset.fetchDataObject();

    //console.log("Data object before update: ", droppedAsset.dataObject);
    await initializeDefaultCheckInObject(droppedAsset as CheckInAsset);


    console.log("CHECK IN DATA OBJECT: ", droppedAsset.dataObject);

    const dataObject = droppedAsset.dataObject as CheckInAsset["dataObject"];
    /*
    if (!dataObject) {
        droppedAsset.dataObject = {} as CheckInDataObject;
    }

    if (!dataObject.dailyCheckIns) {
        dataObject.dailyCheckIns = {};
    }

    if(!dataObject.goal){
      dataObject.goal = 100;
    }

    if(!dataObject.overallTally){
      dataObject.overallTally = 0;
    }
    */


    //const dataObject = droppedAsset.fetchDataObject;
    const overallTally = dataObject?.overallTally ?? 0;

    const goal = dataObject?.goal ?? 100;
    
    const isPopped = overallTally >= goal;

    //checking if any user has checked in today
    const todayKey = getTodayKey();
    const todayEntry = dataObject?.dailyCheckIns?.[todayKey] || {
      total: 0,
      users: {},
      isPopped: isPopped,
    };

    const receivedTotal = todayEntry.total;
    
    //checking user in with current date

    //console.log("Fetched Dropped Asset Data Object: ", droppedAsset.dataObject);

    // If the application will make any updates to a dropped asset's data object we need to
    // first instantiate to ensure it's existence and define it's proper structure.
    // The same should be true for World, User, and Visitor data objects

    
    return res.json({
        success: true,
        message: "Received check in info successfully!",
        tally: receivedTotal,
        goalToPop: goal,
        overallTally: overallTally,
        isPopped: isPopped,
        droppedAsset,
      });

   


    //return res.json({ droppedAsset, success: true });
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
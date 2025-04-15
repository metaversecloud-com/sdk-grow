import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, initializeDroppedAssetDataObject } from "../../utils/index.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";
import { CheckInDataObject } from "../../types/CheckInDataObject.js";
import { getTodayKey } from "./handleCheckIn.js";

export const AdminReset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const profileId = credentials.profileId;
    console.log("Profile ID: ", profileId);
    console.log("Credentials: ", credentials);
    const { assetId, urlSlug } = credentials;
    
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });

    const newGoal = parseInt(req.body.goal as string) || 100;

    
    await droppedAsset.fetchDataObject();

    console.log("Data object before update: ", droppedAsset.dataObject);
    

    const dataObject = droppedAsset.dataObject as CheckInDataObject;

    if (!dataObject) {
        droppedAsset.dataObject = {} as CheckInDataObject;
    }

    if (!dataObject.dailyCheckIns) {
        dataObject.dailyCheckIns = {};
    }
    
    if (!dataObject.overallTally) {
        dataObject.overallTally = 0;
    }

    const overallTally = dataObject.overallTally;

    //changing the goal
    const updates = {
        goal: newGoal,

      };
    
    console.log("Fetched Dropped Asset Data Object: ", droppedAsset.dataObject);

    // If the application will make any updates to a dropped asset's data object we need to
    // first instantiate to ensure it's existence and define it's proper structure.
    // The same should be true for World, User, and Visitor data objects
    
    await droppedAsset.updateDataObject(updates);
    console.log("Updated Dropped Asset Data Object: ", droppedAsset.dataObject);

    await droppedAsset.fetchDataObject();
    console.log("Fetched Dropped Asset Data Object AFTER UPDATE: ", droppedAsset.dataObject);

    return res.json({
        success: true,
        message: "Checked in successfully!",
        goalToPop: newGoal,
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

//resets the tally and gets rid of daily records
export const AdminResetTally = async (req: Request, res: Response) => {
    try {
      const credentials = getCredentials(req.query);
  
      const profileId = credentials.profileId;
      console.log("Profile ID: ", profileId);
      console.log("Credentials: ", credentials);
      const { assetId, urlSlug } = credentials;
      
      const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
  
      const newGoal = parseInt(req.body.goal as string) || 100;
  
      
      await droppedAsset.fetchDataObject();
  
      console.log("Data object before update: ", droppedAsset.dataObject);
      
  
      const dataObject = droppedAsset.dataObject as CheckInDataObject;
      
      //resetting the tally and getting rid of daily records
      const updates = {
         dailyCheckIns: {},
        overallTally: 0,
        isPopped: false,
  
        };
      
      console.log("Fetched Dropped Asset Data Object: ", droppedAsset.dataObject);
  
      // If the application will make any updates to a dropped asset's data object we need to
      // first instantiate to ensure it's existence and define it's proper structure.
      // The same should be true for World, User, and Visitor data objects
      
      await droppedAsset.updateDataObject(updates);
      console.log("Updated Dropped Asset Data Object: ", droppedAsset.dataObject);
  
      await droppedAsset.fetchDataObject();
      console.log("Fetched Dropped Asset Data Object AFTER UPDATE: ", droppedAsset.dataObject);
  
      return res.json({
          success: true,
          message: "RESET TALLY SUCCESSFULLY!",
          goalToPop: newGoal,
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

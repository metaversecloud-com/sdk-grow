import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, initializeDefaultCheckInObject, initializeDroppedAssetDataObject } from "../../utils/index.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";
import { CheckInAsset } from "../../types/CheckInDataObject.js";
import { getTodayKey } from "./handleCheckIn.js";

export const AdminReset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const profileId = credentials.profileId;
    console.log("Profile ID: ", profileId);
    console.log("Credentials: ", credentials);
    const { assetId, urlSlug } = credentials;
    
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials }) as CheckInAsset;

    const newGoal = parseInt(req.body.goal as string) || 100;
    console.log("New Goal: ", newGoal);

    await initializeDefaultCheckInObject(droppedAsset as CheckInAsset);
    console.log("Dropped Asset in AdminCheckIn.ts: ", droppedAsset);
    
    await droppedAsset.fetchDataObject();

    console.log("Data object before update in AdminCheckIn.ts: ", droppedAsset.dataObject);
    
    
    const dataObject = droppedAsset.dataObject as CheckInAsset["dataObject"];

    if(!dataObject){
      throw new Error("Data object is undefined in AdminReset");
    }

    

    const overallTally = dataObject.overallTally ?? 0;
    const isPopped = overallTally >= newGoal;

    
    console.log("Fetched Dropped Asset Data Object: ", droppedAsset.dataObject);

    // If the application will make any updates to a dropped asset's data object we need to
    // first instantiate to ensure it's existence and define it's proper structure.
    // The same should be true for World, User, and Visitor data objects
    if(newGoal >= 0){
        //changing the goal
        const updates = {
            goal: newGoal,

        };
        await droppedAsset.updateDataObject(updates);
        await droppedAsset.fetchDataObject();
        console.log("Updated Dropped Asset Data Object in adminReset: ", droppedAsset.dataObject);
        return res.json({
            success: true,
            message: "Updated goal successfully!",
            goalToPop: newGoal,
            isPopped: isPopped,
            droppedAsset,
          });
    }
    else{
        return res.json({
            success: false,
            message: "Unable to make goal a negative integer!",
            goalToPop: dataObject.goal ?? 100,
            droppedAsset,
          });
    }
    
    /*
    console.log("Updated Dropped Asset Data Object: ", droppedAsset.dataObject);

    await droppedAsset.fetchDataObject();
    console.log("Fetched Dropped Asset Data Object AFTER UPDATE: ", droppedAsset.dataObject);
    */

  

   


    //return res.json({ droppedAsset, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getDroppedAssetDetails",
      message: "Error getting dropped asset instance and data object in AdminReset",
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
      //console.log("Profile ID: ", profileId);
      //console.log("Credentials: ", credentials);
      const { assetId, urlSlug } = credentials;
      
      const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials }) as CheckInAsset;

      //checking if the data object exists - if not, initialize it with default values
      await initializeDefaultCheckInObject(droppedAsset as CheckInAsset);
      //console.log("Dropped Asset in AdminResetTally: ", droppedAsset);

  
      
      await droppedAsset.fetchDataObject();
  
      //console.log("Data object before update in AdminResetTally: ", droppedAsset.dataObject);
      

      
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
      
      //const newOverallTally = (droppedAsset.dataObject as CheckInDataObject).overallTally;
      
      const dataObject = droppedAsset.dataObject as CheckInAsset["dataObject"];

      if(!dataObject){
        throw new Error("Data object is undefined in AdminResetTally");
      }

      console.log("DATA OBJECT GOAL IN ADMINRESETTALLY: ", dataObject.goal);
  
      const newOverallTally = dataObject?.overallTally ?? 0;

  
      
      await droppedAsset.fetchDataObject();
      //console.log("Fetched Dropped Asset Data Object AFTER UPDATE: ", droppedAsset.dataObject);

      //returning success response with tally reset
      return res.json({
          success: true,
          message: "RESET TALLY SUCCESSFULLY!",
          goalToPop: dataObject.goal,
          isPopped: false,
          overallTally:newOverallTally,
          droppedAsset,
        });
  
     
  
  
      //return res.json({ droppedAsset, success: true });
    } catch (error) {
      return errorHandler({
        error,
        functionName: "getDroppedAssetDetails",
        message: "Error getting dropped asset instance and data object in AdminResetTally",
        req,
        res,
      });
    }
  };

import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, initializeDefaultCheckInObject, initializeDroppedAssetDataObject } from "../../utils/index.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";
import { CheckInAsset } from "../../types/CheckInDataObject.js";
import { getTodayKey } from "./handleCheckIn.js";

export const AdminReset = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const profileId = credentials.profileId;
    const { assetId, urlSlug } = credentials;
    
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials }) as CheckInAsset;

    const newGoal = parseInt(req.body.goal as string) || 100;

    await initializeDefaultCheckInObject(droppedAsset as CheckInAsset);
    
    await droppedAsset.fetchDataObject();
    
    
    const dataObject = droppedAsset.dataObject as CheckInAsset["dataObject"];

    if(!dataObject){
      throw new Error("Data object is undefined in AdminReset");
    }

    

    const overallTally = dataObject.overallTally ?? 0;
    const isPopped = overallTally >= newGoal;


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
       
        return res.json({
            success: true,
            message: "Updated goal successfully!",
            goalToPop: newGoal,
            overallTally: overallTally,
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
      const { assetId, urlSlug } = credentials;
      
      const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials }) as CheckInAsset;

      //checking if the data object exists - if not, initialize it with default values
      await initializeDefaultCheckInObject(droppedAsset as CheckInAsset);
      

  
      
      await droppedAsset.fetchDataObject();
  
      

      
      //resetting the tally and getting rid of daily records
      const updates = {
         dailyCheckIns: {},
        overallTally: 0,
        isPopped: false,
  
        };
      
      
  
      // If the application will make any updates to a dropped asset's data object we need to
      // first instantiate to ensure it's existence and define it's proper structure.
      // The same should be true for World, User, and Visitor data objects
      
      await droppedAsset.updateDataObject(updates);
      
      
      //const newOverallTally = (droppedAsset.dataObject as CheckInDataObject).overallTally;
      
      const dataObject = droppedAsset.dataObject as CheckInAsset["dataObject"];

      if(!dataObject){
        throw new Error("Data object is undefined in AdminResetTally");
      }

  
      const newOverallTally = dataObject?.overallTally ?? 0;

      
      await droppedAsset.fetchDataObject();

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

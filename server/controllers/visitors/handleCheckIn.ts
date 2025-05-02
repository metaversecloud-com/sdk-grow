import { Request, Response } from "express";
import { DroppedAsset,World, errorHandler, getCredentials, initializeDroppedAssetDataObject } from "../../utils/index.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";
import { CheckInAsset } from "../../types/CheckInDataObject.js";
import { initializeDefaultCheckInObject } from "../../utils/index.js";




export function getTodayKey(): string{
    const now = new Date();
   const yyyy = now.getFullYear();
   const mm = String(now.getMonth() + 1).padStart(2, "0");
   const dd =  String(now.getDate()).padStart(2, "0");
   return `${yyyy}-${mm}-${dd}`;

}

export const handleCheckIn = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const profileId = credentials.profileId;
    
    const { assetId, urlSlug } = credentials;
    
    //getting world to fire toast message
    const world = World.create(credentials.urlSlug, { credentials });

    //getting dropped asset instance and casting to CheckInAsset
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials }) as CheckInAsset;

    

    await droppedAsset.fetchDataObject();

   
    

    await initializeDefaultCheckInObject(droppedAsset);

    
    await droppedAsset.fetchDataObject();


    const dataObject = droppedAsset.dataObject as CheckInAsset["dataObject"];

    if(!dataObject){
        throw new Error("Data object is undefined");
    }


    //checking if any user has checked in today
    const todayKey = getTodayKey();
    const todayEntry = dataObject?.dailyCheckIns?.[todayKey] || {
      total: 0,
      users: {},
    };
    

    
    //if users is in date mapping (already checked in), return already checked in json message
    if (todayEntry.users[profileId]) {

      await world.fireToast({
        title: "Already Checked In",
        text: "You are already checked in. Please come back tomorrow!",
      });

        // Already checked in
        return res.json({
          success: true,
          message: "You have already checked in today!",
          tally: todayEntry.total,
          overallTally: dataObject?.overallTally ?? 0,
          goalToPop: dataObject?.goal ?? 100,
          droppedAsset,
        });
      }

      //unable to check in - goal already met/balloon already popped 
      if (dataObject.overallTally >= dataObject.goal) {
        dataObject.isPopped = true;

        //firing toast for meeting goal
        await world.fireToast({
          title: "Already met goal",
          text: "You have already met the goal!",
        });

        //the goal has already been meet, but returing success message
        return res.json({
          success: true,
          message: "You have already met the goal!",
          tally: todayEntry.total,
          overallTally: dataObject.overallTally,
          goalToPop: dataObject.goal,
          isPopped: true,
          droppedAsset,
        });
      }
    
    //checking user in with current date
    const newTotal = todayEntry.total + 1;
    const checkInTime = new Date().toISOString();

    //adding 1 to overall tally
    const newOverallTally = dataObject.overallTally + 1;

    const updates = {
        [`dailyCheckIns.${todayKey}.total`]: newTotal,
        // Optionally store the timestamp for each user
        [`dailyCheckIns.${todayKey}.users.${profileId}`]: checkInTime,
        overallTally: newOverallTally,
        isPopped: newOverallTally >= dataObject.goal,
      };
    

    // If the application will make any updates to a dropped asset's data object we need to
    // first instantiate to ensure it's existence and define it's proper structure.
    // The same should be true for World, User, and Visitor data objects
    
    await droppedAsset.updateDataObject(updates);

    await droppedAsset.fetchDataObject();

    //firing toast for successful check in
    await world.fireToast({
      title: "Successfully Checked In",
      text: "You have successfully checked in! Please come back tomorrow!",
    });

    //successful check in with updated data object
    return res.json({
        success: true,
        message: "Checked in successfully!",
        tally: newTotal,
        overallTally: newOverallTally,
        goalToPop: dataObject.goal,
        isPopped: newOverallTally >= dataObject.goal,
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
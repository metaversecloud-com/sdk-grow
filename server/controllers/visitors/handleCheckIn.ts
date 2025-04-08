import { Request, Response } from "express";
import { DroppedAsset, errorHandler, getCredentials, initializeDroppedAssetDataObject } from "../../utils/index.js";
import { IDroppedAsset } from "../../types/DroppedAssetInterface.js";

function getTodayKey(): string{
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
    console.log("Profile ID: ", profileId);
    console.log("Credentials: ", credentials);
    const { assetId, urlSlug } = credentials;
    
    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });
    console.log("Dropped Asset: ", droppedAsset);

    
    await droppedAsset.fetchDataObject();

    console.log("Data object before update: ", droppedAsset.dataObject);

     //Provide a TS type so we can handle dailyCheckIns safely
     //dailyCheckIns is a mapping of data keys to the total number of check ins for that day
     //and a mapping of userIds to the time they checked in
      interface CheckInDataObject {
        dailyCheckIns?: Record<
          string, // date key: "YYYY-MM-DD"
          {
            total: number;
            users: Record<string, string | boolean>; // userId -> checkInTime or boolean
          }
        >;
        //other optional fields
        [key: string]: any;
      }

    const dataObject = droppedAsset.dataObject as CheckInDataObject;

    if (!dataObject) {
        droppedAsset.dataObject = {} as CheckInDataObject;
    }

    if (!dataObject.dailyCheckIns) {
        dataObject.dailyCheckIns = {};
    }

    //checking if any user has checked in today
    const todayKey = getTodayKey();
    const todayEntry = dataObject.dailyCheckIns[todayKey] || {
      total: 0,
      users: {},
    };
    
    //if users is in date mapping (already checked in), return already checked in json message
    if (todayEntry.users[profileId]) {
        // Already checked in
        return res.json({
          success: true,
          message: "You have already checked in today!",
          tally: todayEntry.total,
          droppedAsset,
        });
      }
    
    //checking user in with current date
    const newTotal = todayEntry.total + 1;
    const checkInTime = new Date().toISOString();

    const updates = {
        [`dailyCheckIns.${todayKey}.total`]: newTotal,
        // Optionally store the timestamp for each user
        [`dailyCheckIns.${todayKey}.users.${profileId}`]: checkInTime,
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
        tally: newTotal,
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
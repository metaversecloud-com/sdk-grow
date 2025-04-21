import { DroppedAsset } from "@rtsdk/topia";

export interface CheckInAsset extends DroppedAsset {
  dataObject?: {
    dailyCheckIns?: Record<
      string, // date key: "YYYY-MM-DD"
      {
        total: number;
        users: Record<string, string | boolean>; // userId → check-in time or flag
      }
    >;
    goal: number; // total check-ins goal for the day
    [key: string]: any; // allows other fields
    overallTally: number; // total number of check-ins for current session
    isPopped?: boolean; // flag to check if the balloon has been popped
    shouldReset?: boolean; // flag to check if the goal should be reset
  };
}

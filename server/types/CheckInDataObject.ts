export interface CheckInDataObject {
    dailyCheckIns?: Record<
      string, // date key: "YYYY-MM-DD"
      {
        total: number;
        users: Record<string, string | boolean>; // userId → check-in time or flag
      }
    >;
    [key: string]: any; // allows other fields
  }
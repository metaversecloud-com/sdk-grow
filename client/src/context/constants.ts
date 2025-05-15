export const initialState = {
  error: "",
  gameState: {
    tally: 0,
    goal: 100,
    overallTally: 0,
    imageSrc: "https://sdk-grow.s3.us-east-1.amazonaws.com/Pump-0.png",
  },
  hasInteractiveParams: false,
  hasSetupBackend: false,
  profileId: "",
  sceneDropId: "",
  visitor: { isAdmin: false },
};

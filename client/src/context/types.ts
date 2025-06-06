export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_INTERACTIVE_PARAMS = "SET_INTERACTIVE_PARAMS";
export const SET_GAME_STATE = "SET_GAME_STATE";
export const SET_ERROR = "SET_ERROR";

export type InteractiveParams = {
  assetId: string;
  displayName: string;
  identityId: string;
  interactiveNonce: string;
  interactivePublicKey: string;
  profileId: string;
  sceneDropId: string;
  uniqueName: string;
  urlSlug: string;
  username: string;
  visitorId: string;
};

export interface InitialState {
  error?: string;
  gameState?: {
    dailyCheckIns: Record<string, { total: number }>;
    goal: number;
    overallTally: number;
    imageSrc: string;
  };
  hasInteractiveParams?: boolean;
  hasSetupBackend?: boolean;
  profileId?: string;
  sceneDropId?: string;
  visitor?: { isAdmin: boolean };
}

export type ActionType = {
  type: string;
  payload: InitialState;
};

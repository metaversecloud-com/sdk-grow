import { useContext, useEffect, useState } from "react";

// components
import { PageContainer, PageFooter } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

import { AdminIconButton } from "@/components/AdminIconButton";

const defaultDroppedAsset = { assetName: "", bottomLayerURL: "", id: null, topLayerURL: null };

const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { gameState, hasInteractiveParams, hasSetupBackend } = useContext(GlobalStateContext);

  const [isLoading, setIsLoading] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [droppedAsset, setDroppedAsset] = useState(defaultDroppedAsset);

  const [showSettings, setShowSettings] = useState(false);

  const [admin, SetIsAdmin] = useState(false);

  const [tally, setTally] = useState(0);
  const[overallTally,setOverallTally] = useState(0);
  const[position, setPosition] = useState({ x: 0, y: 0 });

  const[pump_number, setPumpNumber] = useState(0);

  const[goal, setGoal] = useState(0);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/world")
        .then((response) => {
          console.log("REPONSE FOR USEEFFECT: ", response);
          setGameState(dispatch, response.data);
          setDroppedAsset(response.data.droppedAsset);
          console.log("DROPPED ASSET DATA: ", droppedAsset);
        })
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setIsLoading(false);
          console.log("🚀 ~ Home.tsx ~ gameState:", gameState);
        });

      backendAPI
        .get("/visitor")
        .then((response) => {
          console.log("SUCCESS");
          console.log("Response: ", response);
          console.log("RESPONSE DATA: ", response.data);
          const { visitor } = response.data;
          console.log("VISITOR: ", visitor);
          console.log("Visitor Admin: ", visitor.isAdmin);
          SetIsAdmin(visitor.isAdmin);
        })
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setAreButtonsDisabled(false);
        });

        backendAPI
        .get("/check-in-info")
        .then((response) => {
          setTally(response.data.tally);
          console.log("TALLY: ", response.data.tally);
          console.log("GOAL TO POP: ", response.data.goalToPop);
          setGoal(response.data.goalToPop);
          setOverallTally(response.data.overallTally);
          const pump_stage = getPumpStage(response.data.overallTally, response.data.goalToPop);
          setPumpNumber(pump_stage);
          console.log("Pump stage: ", pump_stage);
          //setPumpNumber(getPumpStage())
          console.log("Asset info: ", response.data.droppedAsset);
          setPosition(response.data.droppedAsset.position);
        })
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setAreButtonsDisabled(false);
        });
    }
  }, [hasInteractiveParams]);

  /*
  const handleGetDroppedAsset = async () => {
    setAreButtonsDisabled(true);
    //setDroppedAsset(defaultDroppedAsset);

    backendAPI
      .get("/dropped-asset")
      .then((response) => {
        console.log("Response: ", response);
        setDroppedAsset(response.data.droppedAsset);
        //setting position to use for particle effects
        
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };
  */

  //gets which stage the pump is at
  const getPumpStage = (tally:number, goal:number):number => {
    console.log("TALLY AND GOAL: ", tally, goal);
    //20 pictures
    const stages = 20;
    if(!goal || tally <= 0){
      return 0;
    }
    const ratio = tally/goal;
    const curr_stage = Math.min(stages - 1, Math.floor(ratio * stages));
    return curr_stage;
  }

  const handleCheckIn = async () => {
    setAreButtonsDisabled(true);
    //setDroppedAsset(defaultDroppedAsset);

    backendAPI
      .get("/check-in")
      .then((response) => {
        console.log("Response FOR CHECKING IN: ", response);

        //setting tally and overall tally
        setTally(response.data.tally);
        setOverallTally(response.data.overallTally);
        if(response.status = 200){
            console.log("CHECK IN SUCCESS");
            console.log("POSITION: ", position.x, position.y);
          backendAPI.post("/particle-effects", {includeDataObject: true}, {
        params: {
          //getting position to fire particle effects - couldn't find in devdocs getting position not in droppedasset
          params: { x: position.x, y: position.y }
        },
        })
    .then((response) => {
    
      });
            }
          })
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setAreButtonsDisabled(false);
        });
  };

  const handleWorldAsset = async () => {
    setAreButtonsDisabled(true);
    console.log("ASSET: ", droppedAsset);

    backendAPI
      .get("/world")
      .then((response) => {
        console.log("SUCCESS");
        console.log("Response: ", response);
        return response;
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

  const handleVisitor = async () => {
    setAreButtonsDisabled(true);
    //setDroppedAsset(defaultDroppedAsset);
  };

  if (!hasSetupBackend) return <div />;

  return (
    <PageContainer isLoading={isLoading}>
      <>
        <h1 className="h2">Grow App</h1>

        <div className="flex flex-col w-full ">
          <img className="w-96 h-96 object-cover rounded-2xl my-4" alt="Pump" src={`../../pumps_balloons/Pump-${pump_number}.png` }/>
          {admin && <AdminIconButton showSettings={showSettings} setShowSettings={setShowSettings} />}
        </div>

        <div className="flex flex-col w-full ">Overall Tally: {overallTally}</div>
        <div className="flex flex-col w-full ">Daily Tally: {tally}</div>
        <div className="flex flex-col w-full ">Goal: {goal}</div>
        <PageFooter>
          <button className="btn" disabled={areButtonsDisabled} onClick={handleCheckIn}>
            Check In
          </button>
        </PageFooter>
      </>
    </PageContainer>
  );
};

export default Home;

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
      backendAPI.get("/world").then((response) => {
        console.log("RESPONSE FOR /world NEW: ", response);
        setGameState(dispatch, response.data);
        setDroppedAsset(response.data.droppedAsset);

        return Promise.all([
          backendAPI.get("/visitor"),
          backendAPI.get("/check-in-info"),
        ])
       .then(([visitorRes, checkInInfoRes]) => {
          
          //console.log("DROPPED ASSET DATA: ", droppedAsset);
  
          console.log("SUCCESS");
          console.log("Response: for /visitor: ", visitorRes);
          const { visitor } = visitorRes.data;
          SetIsAdmin(visitor.isAdmin);
  
          setTally(checkInInfoRes.data.tally);
          console.log("RESPONSE FOR /check-in-info:", checkInInfoRes);
          setGoal(checkInInfoRes.data.goalToPop);
          setOverallTally(checkInInfoRes.data.overallTally);
          const pump_stage = getPumpStage(checkInInfoRes.data.overallTally, checkInInfoRes.data.goalToPop);
          setPumpNumber(pump_stage);
          console.log("Pump stage: ", pump_stage)
  
          //console.log("Asset info: ", response.data.droppedAsset);
          setPosition(checkInInfoRes.data.droppedAsset.position);
  
        })
      })
      .catch((error) => {
        console.error("Error fetching initial data from /world:", error);
        setErrorMessage(dispatch, error);
      })
      .finally(() => {
        setIsLoading(false);
        setAreButtonsDisabled(false);
        console.log("🚀 ~ Home.tsx ~ gameState:", gameState);
      });

      
      
      /*
      backendAPI
        .get("/world")
        .then((response) => {
          console.log("REPONSE FOR /world: ", response);
          setGameState(dispatch, response.data);
          //setDroppedAsset(response.data.droppedAsset);
          //console.log("DROPPED ASSET DATA: ", droppedAsset);
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
          console.log("Response: for /visitor: ", response);
          //console.log("RESPONSE DATA: ", response.data);
          const { visitor } = response.data;
          //console.log("VISITOR: ", visitor);
          //console.log("Visitor Admin: ", visitor.isAdmin);
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
          console.log("RESPONSE FOR /check-in-info:", response);
          //console.log("TALLY: ", response.data.tally);
          //console.log("GOAL TO POP: ", response.data.goalToPop);
          setGoal(response.data.goalToPop);
          setOverallTally(response.data.overallTally);
          const pump_stage = getPumpStage(response.data.overallTally, response.data.goalToPop);
          setPumpNumber(pump_stage);
          console.log("Pump stage: ", pump_stage)

          //console.log("Asset info: ", response.data.droppedAsset);
          setPosition(response.data.droppedAsset.position);
        })
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setAreButtonsDisabled(false);
        });

        */

        
    }
  }, [hasInteractiveParams]);
//whenever pump number changes or hasInteractiveParams changes, send to backend to change asset image
  useEffect(() => {
    
    if (pump_number !== null && hasInteractiveParams) {
      backendAPI.post("/change-image", { stage: pump_number });
      //console.log("Pump stage SENT TO BACKEND:", pump_number);
    }
  },[pump_number, hasInteractiveParams]);

  //gets which stage the pump is at
  const getPumpStage = (tally:number, goal:number):number => {
    //("TALLY AND GOAL: ", tally, goal);
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
        //console.log("Response FOR CHECKING IN: ", response);

        //setting tally and overall tally
        setTally(response.data.tally);
        setOverallTally(response.data.overallTally);
        console.log("TALLY, GOAL, OVERALL TALLY: ", response.data.tally, response.data.goalToPop, response.data.overallTally);
        const pump_stage = getPumpStage(response.data.overallTally, response.data.goalToPop);
        setPumpNumber(pump_stage);
        console.log("PUMP STAGE: ", pump_stage);
       
        //if successful check in, even if goal is not reached or balloon popped or already checked in still fire 
        if(response.status = 200){
            //console.log("CHECK IN SUCCESS");
            //console.log("POSITION: ", position.x, position.y);
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
    //console.log("ASSET: ", droppedAsset);

    backendAPI
      .get("/world")
      .then((response) => {
        console.log("SUCCESS");
        //console.log("Response: ", response);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-gray-800">Grow App</h1>
        {admin && (
          <div className="ml-auto">
            <AdminIconButton showSettings={showSettings} setShowSettings={setShowSettings} />
          </div>
        )}
      </div>

      {/* Reduced space between header and image */}
      <div className="flex justify-center mt-2 mb-4">
        <img
          className="w-80 h-80 object-cover rounded-2xl"
          alt="Pump"
          src={`../../pumps_balloons/Pump-${pump_number}.png`}
        />
      </div>

      <div className="grid gap-4 mb-6">
        <div className="bg-blue-100 text-blue-900 p-2 rounded-xl text-lg font-semibold text-center shadow">
          Overall Tally: {overallTally}
        </div>
        <div className="bg-blue-100 text-blue-900 p-2 rounded-xl text-lg font-semibold text-center shadow">
          Daily Tally: {tally}
        </div>
        <div className="bg-blue-100 text-blue-900 p-2 rounded-xl text-lg font-semibold text-center shadow">
          Goal: {goal}
        </div>
      </div>

      <div className="mt-6">
  <button
    className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 text-lg rounded-xl"
    disabled={areButtonsDisabled}
    onClick={handleCheckIn}
  >
    Help Me Grow!
  </button>
</div>
    </div>
  </PageContainer>
  );
};

export default Home;

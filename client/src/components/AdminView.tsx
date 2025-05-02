
import { useContext, useEffect, useState } from "react";

// components
import { PageContainer, PageFooter, ConfirmationModal } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

//navigation
import { useNavigate } from "react-router-dom";


export const AdminView = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [goal, setGoal] = useState(100);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [tally, setTally] = useState(0);
  const [overallTally, setOverallTally] = useState(0);
  const[pump_number, setPumpNumber] = useState(0);
  const navigate = useNavigate();


  function handleToggleShowConfirmationModal() {
    setShowConfirmationModal(!showConfirmationModal);

  }
  //handleResetConfirm resets tally and overallTally
  const handleResetConfirm = (data:any) => {
    setTally(0);
    setOverallTally(data.overallTally);
    setPumpNumber(getPumpStage(data.overallTally, goal));
  }
  //goes back to home page
  const handleRedirect = () => {
    navigate("/");
  };
  const handleReset = async () => {
  
    //setDroppedAsset(defaultDroppedAsset);

    backendAPI
      .put("/admin-reset",{goal: goal})
      .then((response) => {
        setPumpNumber(getPumpStage(response.data.overallTally, response.data.goalToPop));
        
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        
      });
  };

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

  //getting initial tally and goal
  useEffect(() => {
    backendAPI
    .get("/check-in-info")
    .then((response) => {
      setTally(response.data.tally);
      setOverallTally(response.data.overallTally);
      setGoal(response.data.goalToPop);

      //getting initial pump stage - the runtime is somewhat slow with so many useEffects and backend calls
      const initialPumpStage = getPumpStage(response.data.overallTally, response.data.goalToPop);
      setPumpNumber(initialPumpStage);
      
      
    })
    .catch((error) => setErrorMessage(dispatch, error))
    .finally(() => {
      setAreButtonsDisabled(false);
    });
    
  }, []);


  //changes pump image whenever pump number changes
  useEffect(() => {
    if (pump_number !== null) {
      backendAPI.post("/change-image", { stage: pump_number });
    }
  }, [pump_number]);

  return (
    <div className="admin-container p-6">
      <h1 className="mt-6 text-sm text-gray-600">Grow App</h1>
  <h1 className="text-2xl font-bold mb-4">Admin View</h1>

  <div className="mb-4">
  <p className="text-md">
          <span className="font-medium">Overall Tally:</span>{" "}
          <span className="text-blue-700 font-bold">{overallTally}</span>
        </p>
    <p className="text-md">
          <span className="font-medium">Daily Tally:</span>{" "}
          <span className="text-blue-700 font-bold">{tally}</span>
        </p>
    <p className="text-md">
          <span className="font-medium">Goal:</span>{" "}
          <span className="text-blue-700 font-bold">{goal}</span>
        </p>

  </div>

  <div className="mb-4">
    <label htmlFor="goal-input" className="block mb-1 text-sm font-medium w-full">Set New Goal:</label>
    <input
      id="goal-input"
      type="number"
      min={1}
      max={999}
      value={goal}
      onChange={(e) => setGoal(Number(e.target.value))}
      className="border border-gray-300 rounded px-3 py-2 w-full"
    />
  </div>

  <button
    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-3"
    onClick={handleReset}
  >
    Set Goal!
  </button>

  <button
     className="w-full bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 mb-6"
     onClick={handleRedirect}
  >
    Back
  </button>

  <PageFooter>
        <button className="btn btn-danger" onClick={() => handleToggleShowConfirmationModal()}>
          Reset
        </button>
      </PageFooter>

  


      {showConfirmationModal && (
        <ConfirmationModal handleToggleShowConfirmationModal={handleToggleShowConfirmationModal} 
        handleConfirm = {handleResetConfirm}/>
      )}
    </div>

    
  );
};

export default AdminView;


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
  const navigate = useNavigate();


  function handleToggleShowConfirmationModal() {
    setShowConfirmationModal(!showConfirmationModal);

  }
  //handleResetConfirm resets tally and overallTally
  const handleResetConfirm = (data:any) => {
    setTally(0);
    console.log("CURRENT OVERALLY TALLY: ", overallTally);
    setOverallTally(data.overallTally);
  }
  //goes back to home page
  const handleRedirect = () => {
    navigate("/");
  };
  const handleReset = async () => {
    console.log("CURRENT GOAL: ", goal);
    //setDroppedAsset(defaultDroppedAsset);

    backendAPI
      .put("/admin-reset",{goal: goal})
      .then((response) => {
        console.log("Response: ", response);
        console.log("RESPONSE DATA FOR RESETTING GOAL: ", response.data);
        console.log("RESPONSE GOAL: ", response.data.goalToPop);
        
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        
      });
  };

  useEffect(() => {
    backendAPI
    .get("/check-in-info")
    .then((response) => {
      console.log("Response DATA: ", response.data);
      console.log("RESPONSE TALLY: ", response.data.tally);
      setTally(response.data.tally);
      setOverallTally(response.data.overallTally);
      console.log("Asset info: ", response.data.droppedAsset);
      setGoal(response.data.goalToPop);
      console.log("GOAL FROM JSON: ", response.data.goalToPop);
      
      
    })
    .catch((error) => setErrorMessage(dispatch, error))
    .finally(() => {
      setAreButtonsDisabled(false);
    });
    
  }, []);

  return (
    <div className="admin-container p-6">
  <h1 className="text-2xl font-bold mb-4">Admin View</h1>

  <div className="mb-4">
    <h2 className="text-lg">Current Tally: <span className="font-medium">{overallTally}</span></h2>
    <h2 className="text-lg">Daily Tally: <span className="font-medium">{tally}</span></h2>
    <h2 className="text-lg">Goal: <span className="font-medium">{goal}</span></h2>

  </div>

  <div className="mb-4">
    <label htmlFor="goal-input" className="block mb-1 text-sm font-medium">Set New Goal:</label>
    <input
      id="goal-input"
      type="number"
      min={1}
      max={999}
      value={goal}
      onChange={(e) => setGoal(Number(e.target.value))}
      className="border border-gray-300 rounded px-3 py-1 w-32"
    />
  </div>

  <button
    className="reset-goal-button bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    onClick={handleReset}
  >
    Set Goal!
  </button>

  <button
    className="back-button bg-gray-700 text-white px-4 py-2 ml-2 rounded hover:bg-blue-700"
    onClick={handleRedirect}
  >
    Back
  </button>

  <PageFooter>
        <button className="btn btn-danger" onClick={() => handleToggleShowConfirmationModal()}>
          Reset
        </button>
      </PageFooter>

  <p className="mt-6 text-sm text-gray-600">Grow App</p>


      {showConfirmationModal && (
        <ConfirmationModal handleToggleShowConfirmationModal={handleToggleShowConfirmationModal} 
        handleConfirm = {handleResetConfirm}/>
      )}
    </div>

    
  );
};

export default AdminView;

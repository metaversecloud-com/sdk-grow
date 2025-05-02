import { useContext, useState } from "react";

// components
import { PageFooter, ConfirmationModal } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, getTally, setErrorMessage, setGameState } from "@/utils";

export const AdminView = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { gameState } = useContext(GlobalStateContext);
  const { dailyCheckIns, goal, overallTally } = gameState || {};

  const tally = getTally(dailyCheckIns);

  const [updatedGoal, setUpdatedGoal] = useState(goal);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  function handleToggleShowConfirmationModal() {
    setShowConfirmationModal(!showConfirmationModal);
  }

  const handleSetGoal = async () => {
    setAreButtonsDisabled(true);
    backendAPI
      .put("/goal", { goal: updatedGoal })
      .then((response) => {
        const { gameState } = response.data;
        setGameState(dispatch, { gameState });
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setAreButtonsDisabled(false));
  };

  const handleReset = async () => {
    setAreButtonsDisabled(true);
    backendAPI
      .put("/reset")
      .then((response) => {
        const { gameState } = response.data;
        setGameState(dispatch, { gameState });
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => setAreButtonsDisabled(false));
  };

  return (
    <>
      <div className="mb-4">
        <p className="text-md">
          <span className="font-medium">Overall Tally:</span>{" "}
          <span className="text-blue-700 font-bold">{overallTally}</span>
        </p>
        <p className="text-md">
          <span className="font-medium">Daily Tally:</span> <span className="text-blue-700 font-bold">{tally}</span>
        </p>
        <p className="text-md">
          <span className="font-medium">Goal:</span> <span className="text-blue-700 font-bold">{goal}</span>
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="goal-input" className="block mb-1 text-sm font-medium w-full">
          Set New Goal:
        </label>
        <input
          id="goal-input"
          type="number"
          min={1}
          max={999}
          value={updatedGoal}
          onChange={(e) => setUpdatedGoal(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2 w-full"
        />
      </div>

      <PageFooter>
        <button className="btn mb-2" disabled={areButtonsDisabled} onClick={handleSetGoal}>
          Set Goal
        </button>

        <button
          className="btn btn-danger"
          disabled={areButtonsDisabled}
          onClick={() => handleToggleShowConfirmationModal()}
        >
          Reset
        </button>
      </PageFooter>

      {showConfirmationModal && (
        <ConfirmationModal
          title="Reset?"
          message="All player data will be erased."
          handleToggleShowConfirmationModal={handleToggleShowConfirmationModal}
          handleConfirm={handleReset}
        />
      )}
    </>
  );
};

export default AdminView;

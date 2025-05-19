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
      <div className="mb-4 grid gap-2">
        <h4>
          Overall Tally: <strong>{overallTally}</strong>
        </h4>
        <h4>Daily Tally: {tally}</h4>
        <h4>Goal: {goal}</h4>

        <hr className="my-2" />
        <label htmlFor="goal-input" className="h4">
          Set New Goal:
        </label>
        <input
          id="goal-input"
          type="number"
          min={1}
          max={999}
          value={updatedGoal}
          onChange={(e) => setUpdatedGoal(Number(e.target.value))}
          className="input"
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

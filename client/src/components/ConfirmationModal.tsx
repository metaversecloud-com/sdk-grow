/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useState } from "react";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const ConfirmationModal = ({
  handleToggleShowConfirmationModal,
}: {
  handleToggleShowConfirmationModal: () => void;
}) => {
  const dispatch = useContext(GlobalDispatchContext);

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

<<<<<<< HEAD
  const handleReset = () => {
=======
  const handleResetQuiz = () => {
>>>>>>> main
    setAreButtonsDisabled(true);

    backendAPI
      .post(`/admin/reset`)
      .then((response: { data: any }) => setGameState(dispatch, response.data))
      .catch((error: any) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
        handleToggleShowConfirmationModal();
      });
  };

  return (
    <div className="modal-container">
      <div className="modal">
<<<<<<< HEAD
        <h4>Reset?</h4>
=======
        <h4>Reset Quiz?</h4>
>>>>>>> main
        <p>All player data will be erased.</p>
        <div className="actions">
          <button
            id="close"
            className="btn btn-outline"
            onClick={() => handleToggleShowConfirmationModal()}
            disabled={areButtonsDisabled}
          >
            No
          </button>
<<<<<<< HEAD
          <button className="btn btn-danger-outline" onClick={() => handleReset()} disabled={areButtonsDisabled}>
=======
          <button className="btn btn-danger-outline" onClick={() => handleResetQuiz()} disabled={areButtonsDisabled}>
>>>>>>> main
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

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

  const handleFullTallyReset = () => {
    setAreButtonsDisabled(true);

    backendAPI
      .put(`/admin-reset-tally`)
      .then((response: { data: any }) => 
          
        //setGameState(dispatch, response.data)
        console.log("RESPONSE DATA FROM MODAL: ", response.data)
      )
      .catch((error: any) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
        handleToggleShowConfirmationModal();
      });
  };

  return (
    <div className="modal-container">
      <div className="modal">
        <h4>Reset Tally??</h4>
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
          <button className="btn btn-danger-outline" onClick={() => handleFullTallyReset()} disabled={areButtonsDisabled}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

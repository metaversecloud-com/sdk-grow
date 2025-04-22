/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useState } from "react";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

export const ConfirmationModal = ({
  handleToggleShowConfirmationModal,
  handleConfirm, //need this to pass tally data back to admin view

}: {
  handleToggleShowConfirmationModal: () => void;
  handleConfirm: (responseData: any) => void;
}) => {
  const dispatch = useContext(GlobalDispatchContext);

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  const handleFullTallyReset = () => {
    setAreButtonsDisabled(true);

    backendAPI
      .put(`/admin-reset-tally`)
      .then((response: { data: any }) => {
          
        //setGameState(dispatch, response.data)
        console.log("RESPONSE DATA FROM MODAL: ", response.data);
        handleConfirm(response.data); //pass the data back to the admin view
  })
      .catch((error: any) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
        handleToggleShowConfirmationModal();
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <h1 className="text-2xl font-bold mb-3 text-center">Reset Tally?</h1>
        <p className="text-md text-center mb-6 text-gray-700">
          All player data will be erased.
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 disabled:opacity-50"
            onClick={handleToggleShowConfirmationModal}
            disabled={areButtonsDisabled}
          >
            No
          </button>
          <button
            className="px-4 py-2 rounded border border-red-600 text-red-600 hover:bg-red-100 disabled:opacity-50"
            onClick={handleFullTallyReset}
            disabled={areButtonsDisabled}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

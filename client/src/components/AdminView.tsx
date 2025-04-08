import { useState } from "react";

// components
import { PageFooter, ConfirmationModal } from "@/components";

export const AdminView = () => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [goal, setGoal] = useState(100);
  const [currentTally, setCurrentTally] = useState(0);

  function handleToggleShowConfirmationModal() {
    setShowConfirmationModal(!showConfirmationModal);
  }

  return (
    <div style={{ position: "relative" }}>
      <div></div>
      <div>
        <h1>Admin View</h1>
        <h2>Current Tally: {currentTally}</h2>
        <h2>Goal: {goal}</h2>
        <div></div>
      </div>

      <div>
        <input type="number" min={1} max={999} value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
      </div>

      <p> Grow App</p>
      <PageFooter>
        <button className="btn btn-danger" onClick={() => handleToggleShowConfirmationModal()}>
          Reset
        </button>
      </PageFooter>

      {showConfirmationModal && (
        <ConfirmationModal handleToggleShowConfirmationModal={handleToggleShowConfirmationModal} />
      )}
    </div>
  );
};

export default AdminView;

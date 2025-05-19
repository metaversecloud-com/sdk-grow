import { useContext, useEffect, useState } from "react";

// components
import { PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, getTally, setErrorMessage, setGameState } from "@/utils";

const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { gameState, hasInteractiveParams, hasSetupBackend } = useContext(GlobalStateContext);
  const { dailyCheckIns, goal, overallTally, imageSrc } = gameState || {};

  const tally = getTally(dailyCheckIns);

  const [isLoading, setIsLoading] = useState(true);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/game-state")
        .then((response) => {
          const { gameState, visitor } = response.data;
          setGameState(dispatch, { gameState, visitor });
        })
        .catch((error) => {
          console.error("Error fetching game state", error);
          setErrorMessage(dispatch, error);
        })
        .finally(() => {
          setIsLoading(false);
          setAreButtonsDisabled(false);
        });
    }
  }, [hasInteractiveParams]);

  const handleCheckIn = async () => {
    setAreButtonsDisabled(true);

    backendAPI
      .get("/check-in")
      .then((response) => {
        const { gameState } = response.data;
        setGameState(dispatch, { gameState });
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

  if (!hasSetupBackend) return <div />;

  return (
    <PageContainer isLoading={isLoading} headerText="Grow">
      {imageSrc && (
        <div className="flex justify-center mt-2 mb-4">
          <img className="w-80 h-80 object-cover rounded-2xl" alt="Pump" src={imageSrc} />
        </div>
      )}
      <div className="grid gap-4 mb-6 text-center gap-4">
        <div className="bg-gray-100 p-1 rounded-xl text-lg shadow">Overall Tally: {overallTally}</div>
        <div className="bg-gray-100 p-1 rounded-xl text-lg shadow">Daily Tally: {tally}</div>
        <div className="bg-gray-100 p-1 rounded-xl text-lg shadow">Goal: {goal}</div>
      </div>

      <div className="mt-6">
        <button className="btn" disabled={areButtonsDisabled} onClick={handleCheckIn}>
          Help Me Grow!
        </button>
      </div>
    </PageContainer>
  );
};

export default Home;

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

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/world")
        .then((response) => {
          console.log("REPONSE FOR USEEFFECT: ", response);
          setGameState(dispatch, response.data);
          setDroppedAsset(response.data.droppedAsset);
          console.log("DROPPED ASSET DATA: ", droppedAsset);
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
          console.log("Response: ", response);
          console.log("RESPONSE DATA: ", response.data);
          const { visitor } = response.data;
          console.log("VISITOR: ", visitor);
          console.log("Visitor Admin: ", visitor.isAdmin);
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
        })
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setAreButtonsDisabled(false);
        });
    }
  }, [hasInteractiveParams]);

  const handleGetDroppedAsset = async () => {
    setAreButtonsDisabled(true);
    //setDroppedAsset(defaultDroppedAsset);

    backendAPI
      .get("/dropped-asset")
      .then((response) => {
        console.log("Response: ", response);
        setDroppedAsset(response.data.droppedAsset);
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

  const handleCheckIn = async () => {
    setAreButtonsDisabled(true);
    //setDroppedAsset(defaultDroppedAsset);

    backendAPI
      .get("/check-in")
      .then((response) => {
        console.log("Response FOR CHECKING IN: ", response);
        setTally(response.data.tally);
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

  const handleWorldAsset = async () => {
    setAreButtonsDisabled(true);
    console.log("ASSET: ", droppedAsset);

    backendAPI
      .get("/world")
      .then((response) => {
        console.log("SUCCESS");
        console.log("Response: ", response);
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
      <>
        <h1 className="h2">Grow App</h1>

        <div className="flex flex-col w-full ">
          <img className="w-96 h-96 object-cover rounded-2xl my-4" alt="Pump" src="../../public/Pump0.png" />
          {admin && <AdminIconButton showSettings={showSettings} setShowSettings={setShowSettings} />}
        </div>

        <div className="flex flex-col w-full ">Tally: {tally}</div>

        <PageFooter>
          <button className="btn" disabled={areButtonsDisabled} onClick={handleCheckIn}>
            Check In
          </button>
        </PageFooter>
      </>
    </PageContainer>
  );
};

export default Home;

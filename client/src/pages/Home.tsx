import { useContext, useEffect, useState } from "react";

// components
import { PageContainer, PageFooter } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@/context/GlobalContext";

// utils
import { backendAPI, setErrorMessage, setGameState } from "@/utils";

<<<<<<< HEAD
=======
import {AdminIconButton} from "@/components/AdminIconButton";

>>>>>>> main
const defaultDroppedAsset = { assetName: "", bottomLayerURL: "", id: null, topLayerURL: null };

const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { gameState, hasInteractiveParams, hasSetupBackend } = useContext(GlobalStateContext);

  const [isLoading, setIsLoading] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [droppedAsset, setDroppedAsset] = useState(defaultDroppedAsset);

<<<<<<< HEAD
  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/dropped-asset")
        .then((response) => {
          setGameState(dispatch, response.data);
          setDroppedAsset(response.data.droppedAsset);
        })
        .then(() => {
          backendAPI.put("/world/fire-toast");
=======
  const [showSettings, setShowSettings] = useState(false);

  const[admin, SetIsAdmin] = useState(false);

  const[tally, setTally] = useState(0);


  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/world")
        .then((response) => {
          console.log("REPONSE FOR USEEFFECT: ", response);
          setGameState(dispatch, response.data);
          setDroppedAsset(response.data.droppedAsset);
          console.log("DROPPED ASSET DATA: ", droppedAsset);
>>>>>>> main
        })
        .catch((error) => setErrorMessage(dispatch, error))
        .finally(() => {
          setIsLoading(false);
          console.log("🚀 ~ Home.tsx ~ gameState:", gameState);
        });
<<<<<<< HEAD
=======

         backendAPI
      .get("/visitor")
      .then((response) => {
        console.log("SUCCESS");
        console.log("Response: ", response);
        console.log("RESPONSE DATA: ", response.data);
        const  {visitor}  = response.data;
        console.log("VISITOR: ", visitor);
        console.log("Visitor Admin: ", visitor.isAdmin);
        SetIsAdmin(visitor.isAdmin);
        
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
>>>>>>> main
    }
  }, [hasInteractiveParams]);

  const handleGetDroppedAsset = async () => {
    setAreButtonsDisabled(true);
<<<<<<< HEAD
    setDroppedAsset(defaultDroppedAsset);
=======
    //setDroppedAsset(defaultDroppedAsset);
>>>>>>> main

    backendAPI
      .get("/dropped-asset")
      .then((response) => {
<<<<<<< HEAD
=======
        console.log("Response: ", response);
>>>>>>> main
        setDroppedAsset(response.data.droppedAsset);
      })
      .catch((error) => setErrorMessage(dispatch, error))
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

<<<<<<< HEAD
=======
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

>>>>>>> main
  if (!hasSetupBackend) return <div />;

  return (
    <PageContainer isLoading={isLoading}>
      <>
<<<<<<< HEAD
        <h1 className="h2">Server side example using interactive parameters</h1>
        <div className="max-w-screen-lg">
          {!hasInteractiveParams ? (
            <p>
              Edit an asset in your world and open the Links page in the Modify Asset drawer and add a link to your
              website or use &quot;http://localhost:3000&quot; for testing locally. You can also add assetId,
              interactiveNonce, interactivePublicKey, urlSlug, and visitorId directly to the URL as search parameters to
              use this feature.
            </p>
          ) : (
            <p className="my-4">Interactive parameters found, nice work!</p>
          )}
        </div>

        {droppedAsset.id && (
          <div className="flex flex-col w-full items-start">
            <p className="mt-4 mb-2">
              You have successfully retrieved the dropped asset details for {droppedAsset.assetName}!
            </p>
            <img
              className="w-96 h-96 object-cover rounded-2xl my-4"
              alt="preview"
              src={droppedAsset.topLayerURL || droppedAsset.bottomLayerURL}
            />
          </div>
        )}

        <PageFooter>
          <button className="btn" disabled={areButtonsDisabled} onClick={handleGetDroppedAsset}>
            Get Dropped Asset Details
=======
        <h1 className="h2">Grow App</h1>

     
          <div className="flex flex-col w-full ">
            <img
              className="w-96 h-96 object-cover rounded-2xl my-4"
              alt="Pump"
              src = "../../public/Pump0.png"
            />
           {admin && <AdminIconButton showSettings = {showSettings} setShowSettings= {setShowSettings} />}
            
          </div>

          <div className="flex flex-col w-full ">
            Tally: {tally}
          </div>


        

        <PageFooter>
          <button className="btn" disabled={areButtonsDisabled} onClick={handleCheckIn}>
            Check In
>>>>>>> main
          </button>
        </PageFooter>
      </>
    </PageContainer>
  );
};

export default Home;

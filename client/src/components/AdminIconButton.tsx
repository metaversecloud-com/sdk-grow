<<<<<<< HEAD
=======
import { useNavigate } from "react-router-dom";

>>>>>>> main
export const AdminIconButton = ({
  setShowSettings,
  showSettings,
}: {
  setShowSettings: (value: boolean) => void;
  showSettings: boolean;
}) => {
<<<<<<< HEAD
  return (
    <button className="icon-with-rounded-border mb-4" onClick={() => setShowSettings(showSettings)}>
      <img src={`https://sdk-style.s3.amazonaws.com/icons/${showSettings ? "arrow" : "cog"}.svg`} />
=======
  const navigate = useNavigate();

  return (
    <button className="icon-with-rounded-border mb-4" onClick={() => navigate("/admin")}>
      <img src={`https://sdk-style.s3.amazonaws.com/icons/${showSettings ? "arrow" : "cog"}.svg`} />
     
>>>>>>> main
    </button>
  );
};

export default AdminIconButton;

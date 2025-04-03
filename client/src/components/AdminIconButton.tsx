import { useNavigate } from "react-router-dom";

export const AdminIconButton = ({
  setShowSettings,
  showSettings,
}: {
  setShowSettings: (value: boolean) => void;
  showSettings: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <button className="icon-with-rounded-border mb-4" onClick={() => navigate("/admin")}>
      <img src={`https://sdk-style.s3.amazonaws.com/icons/${showSettings ? "arrow" : "cog"}.svg`} />
     
    </button>
  );
};

export default AdminIconButton;

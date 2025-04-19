import { Navigate } from "react-router-dom";

// Redirect to the actual home page
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;

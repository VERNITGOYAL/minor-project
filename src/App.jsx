import { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import PaperDiffPreloader from "./pages/preloader";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AppRoutes />
      {isLoading && (
        <PaperDiffPreloader onComplete={() => setIsLoading(false)} />
      )}
    </>
  );
}

export default App;
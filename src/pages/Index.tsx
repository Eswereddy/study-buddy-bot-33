import { useState } from "react";
import Landing from "@/components/Landing";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [started, setStarted] = useState(false);

  if (started) return <Dashboard />;
  return <Landing onGetStarted={() => setStarted(true)} />;
};

export default Index;

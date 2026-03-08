import { useAuth } from "@/hooks/useAuth";
import Landing from "@/components/Landing";
import Dashboard from "@/components/Dashboard";
import AuthPage from "@/pages/AuthPage";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Dashboard />;

  return <AuthPage />;
};

export default Index;

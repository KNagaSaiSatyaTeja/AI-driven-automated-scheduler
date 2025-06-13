import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Rooms from "@/pages/rooms";
import Faculty from "@/pages/faculty";
import Upload from "@/pages/upload";
import Insights from "@/pages/insights";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";
import AdminPanel from "@/pages/admin-panel";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no authentication, show login/signup routes only
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <Route path="/" component={Login} />
          <Route component={Login} />
        </Switch>
      </div>
    );
  }

  // If authenticated, show main app
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/rooms" component={Rooms} />
        <Route path="/rooms/:id" component={Rooms} />
        <Route path="/faculty" component={Faculty} />
        <Route path="/faculty/:id" component={Faculty} />
        <Route path="/upload" component={Upload} />
        <Route path="/insights" component={Insights} />
        {user?.role === 'admin' && (
          <Route path="/admin" component={AdminPanel} />
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="room-scheduler-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

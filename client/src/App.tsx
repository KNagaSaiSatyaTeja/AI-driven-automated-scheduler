import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import NotFound from "@/pages/not-found";
import AdminPanel from "@/pages/admin-panel";
import GenerateSchedule from "@/pages/generate-schedule";
import FacultyPage from "@/pages/faculty";
import SubjectsPage from "@/pages/subjects";
import BreaksPage from "@/pages/breaks";
import CollegeTimePage from "@/pages/college-time";

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

  // If authenticated, show main app with role-based routing
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Switch>
        <Route path="/">
          {user?.role === 'admin' ? <AdminPanel /> : <Dashboard />}
        </Route>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/faculty" component={FacultyPage} />
        <Route path="/subjects" component={SubjectsPage} />
        <Route path="/breaks" component={BreaksPage} />
        <Route path="/schedule" component={Dashboard} />
        {user?.role === 'admin' && (
          <>
            <Route path="/admin" component={AdminPanel} />
            <Route path="/admin-panel" component={AdminPanel} />
            <Route path="/generate-schedule" component={GenerateSchedule} />
            <Route path="/generate" component={GenerateSchedule} />
            <Route path="/college-time" component={CollegeTimePage} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ai-scheduler-theme">
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

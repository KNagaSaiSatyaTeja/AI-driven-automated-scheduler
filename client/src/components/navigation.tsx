import { Link, useLocation } from "wouter";
import { Calendar, Users, Building, BarChart3, Upload, LogOut, Settings, Eye, BookOpen, Coffee, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  
  // Different navigation for admin vs user
  const navItems = isAdmin 
    ? [
        { path: "/", label: "Dashboard", icon: Calendar },
        { path: "/faculty", label: "Faculty", icon: Users },
        { path: "/subjects", label: "Subjects", icon: BookOpen },
        { path: "/breaks", label: "Breaks", icon: Coffee },
        { path: "/college-time", label: "College Time", icon: Clock },
        { path: "/generate", label: "Generate Schedule", icon: Upload },
      ]
    : [
        { path: "/", label: "Dashboard", icon: Eye },
        { path: "/faculty", label: "Faculty", icon: Users },
        { path: "/subjects", label: "Subjects", icon: BookOpen },
        { path: "/schedule", label: "View Schedule", icon: Calendar },
      ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Room Scheduler
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.username} ({user?.role})
            </span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

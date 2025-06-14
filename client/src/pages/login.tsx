import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, UserCog } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginError, isLoginLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <Card className="w-full max-w-md border-gray-200 dark:border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <LogIn className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            AI-Driven Automated Scheduler
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign in to manage intelligent scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black dark:text-white">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black dark:text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                placeholder="Enter your password"
              />
            </div>
            {loginError && (
              <Alert className="border-red-200 dark:border-red-800">
                <AlertDescription className="text-red-600 dark:text-red-400">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Default Login Credentials
              </h4>
              <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>Admin:</strong> scheduler_admin / AdminScheduler2024!</p>
                <p><strong>Demo User:</strong> demo_user / DemoUser2024!</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
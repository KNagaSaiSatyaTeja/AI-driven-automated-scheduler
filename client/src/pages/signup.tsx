import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus } from 'lucide-react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const { signup, signupError, isSignupLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup({ username, email, password, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <Card className="w-full max-w-md border-gray-200 dark:border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <UserPlus className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Join the AI-Driven Automated Scheduler platform
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
              <Label htmlFor="email" className="text-black dark:text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white"
                placeholder="Enter your email"
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
            <div className="space-y-2">
              <Label htmlFor="role" className="text-black dark:text-white">
                Role
              </Label>
              <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)}>
                <SelectTrigger className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-black border-gray-300 dark:border-gray-700">
                  <SelectItem value="user" className="text-black dark:text-white">User</SelectItem>
                  <SelectItem value="admin" className="text-black dark:text-white">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {signupError && (
              <Alert className="border-red-200 dark:border-red-800">
                <AlertDescription className="text-red-600 dark:text-red-400">
                  {signupError}
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isSignupLoading}
            >
              {isSignupLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
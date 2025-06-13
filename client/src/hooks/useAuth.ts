import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: user, error } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      return apiRequest('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
    } else if (user || error) {
      setIsLoading(false);
    }
  }, [user, error]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
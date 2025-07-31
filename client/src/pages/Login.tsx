import React from 'react';
import { useLocation } from 'wouter';
import MainHome from './MainHome';

export default function Login() {
  const [, setLocation] = useLocation();

  // Since we're using Google authentication now, just redirect to main home
  React.useEffect(() => {
    setLocation('/');
  }, [setLocation]);

  return <MainHome />;
}
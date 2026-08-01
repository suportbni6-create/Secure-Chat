import React from 'react';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from './hooks/useAuth';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthorized, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !isAuthorized) {
      setLocation('/');
    }
  }, [isLoading, isAuthorized, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthorized ? <Component /> : null;
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Switch>
          <Route path="/" component={LoginPage} />
          <Route path="/chat">
            {() => <ProtectedRoute component={ChatPage} />}
          </Route>
          <Route>
            {() => (
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold font-serif">404</h1>
                  <p className="text-muted-foreground">Not found</p>
                </div>
              </div>
            )}
          </Route>
        </Switch>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;

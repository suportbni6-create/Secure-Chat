import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { signInAnonymouslyUser } from '../firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const secretCode = import.meta.env.VITE_SECRET_CODE;
    
    if (code !== secretCode) {
      toast({
        title: 'Access Denied',
        description: 'Incorrect code. This space is private.',
        variant: 'destructive',
      });
      setCode('');
      return;
    }

    setIsLoading(true);
    try {
      await signInAnonymouslyUser();
      setLocation('/chat');
    } catch (err: any) {
      toast({
        title: 'Connection Error',
        description: err.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-2xl max-h-2xl bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif">WB</h1>
          <p className="text-muted-foreground text-center text-sm uppercase tracking-widest">
            Private Channel
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full flex flex-col space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Access Code"
              className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-2xl text-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !code}
            className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-medium text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

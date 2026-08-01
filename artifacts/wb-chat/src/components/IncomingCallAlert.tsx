import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { CallData } from '../types';

interface IncomingCallAlertProps {
  callData: CallData | null;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallAlert({ callData, onAccept, onReject }: IncomingCallAlertProps) {
  if (!callData || callData.type !== 'offer') return null;

  return (
    <div className="fixed inset-x-4 top-4 z-50 bg-card border border-border shadow-xl rounded-2xl p-4 animate-in slide-in-from-top-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Incoming Call</h3>
          <p className="text-sm text-muted-foreground">Partner is calling...</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onReject}
          className="w-10 h-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
        <button 
          onClick={onAccept}
          className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-90"
        >
          <Phone className="w-5 h-5 animate-pulse" />
        </button>
      </div>
    </div>
  );
}

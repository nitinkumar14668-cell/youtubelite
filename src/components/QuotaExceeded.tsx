import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function QuotaExceeded({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="bg-[#272727] p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center">
        <AlertCircle className="w-16 h-16 text-stone-400 mb-6" strokeWidth={1.5} />
        <h2 className="text-xl font-medium text-white mb-3">
          Daily limit reached.
        </h2>
        <p className="text-stone-400 text-sm mb-8">
          Please try again tomorrow.
        </p>
        
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-6 py-2.5 bg-[#3f3f3f] hover:bg-[#4f4f4f] text-white font-medium rounded-full transition-colors w-full sm:w-auto"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

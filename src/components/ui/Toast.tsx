import React, { useEffect } from 'react';
import { ToastMessage } from '../../types';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-[calc(env(safe-area-inset-top)+20px)] left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} remove={() => removeToast(t.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; remove: () => void }> = ({ toast, remove }) => {
  useEffect(() => {
    const timer = setTimeout(remove, 3000);
    return () => clearTimeout(timer);
  }, [remove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  return (
    <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 animate-float shadow-lg pointer-events-auto">
      {icons[toast.type]}
      <p className="text-white text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={remove} className="text-white/50 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-display font-black text-slate-800 mb-2">عذراً، حدث خطأ غير متوقع</h1>
          <p className="text-sm font-bold text-slate-400 mb-8 max-w-xs leading-loose">
            نعتذر عن هذا الخلل. يمكنك محاولة إعادة تحميل التطبيق مرة أخرى.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="h-14 bg-shirqat-primary text-white px-8 rounded-2xl font-black shadow-xl shadow-shirqat-primary/20 flex items-center gap-3 active:scale-95 transition-all"
          >
            <RotateCcw size={20} /> تحديث التطبيق
          </button>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-slate-100 rounded-xl text-left text-[10px] font-mono text-slate-500 max-w-full overflow-auto">
              {error?.toString()}
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}


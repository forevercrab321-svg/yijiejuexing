import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/50 mb-6 animate-pulse">
             <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2 font-['Cinzel'] tracking-widest">SYSTEM CRITICAL ERROR</h1>
          <p className="text-sm text-slate-400 mb-8 max-w-md leading-relaxed font-mono bg-black/50 p-4 rounded-lg border border-slate-800">
            {this.state.error?.message || "Unknown anomaly detected in the soul link matrix."}
          </p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
                onClick={this.handleReset}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
                <RefreshCw className="w-4 h-4" /> REBOOT SYSTEM
            </button>
            <button 
                onClick={() => window.location.reload()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
                <Shield className="w-4 h-4" /> SAFE MODE RELOAD
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
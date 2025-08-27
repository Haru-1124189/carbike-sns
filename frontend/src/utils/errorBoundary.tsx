import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // エラーをログに記録（本番環境では外部サービスに送信）
    if (process.env.NODE_ENV === 'production') {
      // 本番環境でのエラーログ送信
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // エラーを外部サービスに送信する処理
    // 例: Sentry, LogRocket, など
    try {
      // エラー情報をサーバーに送信
      fetch('/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // エラーログ送信に失敗してもアプリは継続
      });
    } catch {
      // エラーログ送信でエラーが発生してもアプリは継続
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-surface-light p-6 max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">エラーが発生しました</h2>
            <p className="text-gray-400 mb-4">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            
            <div className="space-y-2">
              <button
                onClick={this.handleRetry}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition-colors"
              >
                再試行
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-surface-light text-white py-2 px-4 rounded-lg hover:bg-surface-light/80 transition-colors"
              >
                ページを再読み込み
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer">
                  エラー詳細（開発モード）
                </summary>
                <pre className="text-xs text-red-400 mt-2 p-2 bg-red-900/20 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

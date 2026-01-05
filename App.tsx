import { Component, ErrorInfo, ReactNode } from 'react';
import { JarvisInterface } from './components/JarvisInterface';
import './styles/globals.css';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#000000', 
          color: '#ff0000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px',
          fontFamily: 'monospace'
        }}>
          <h1>Error Loading JARVIS</h1>
          <pre style={{ color: '#06b6d4', marginTop: '20px' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  console.log('App component rendering...');
  
  // Try rendering with a simple fallback first
  try {
  return (
      <ErrorBoundary>
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#000000',
          color: '#06b6d4',
          width: '100%',
          height: '100vh',
          display: 'block',
          position: 'relative'
        }}>
          <JarvisInterface />
            </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error in App render:', error);
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ff0000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div>
          <h1>Error Loading JARVIS</h1>
          <pre>{String(error)}</pre>
        </div>
    </div>
  );
  }
}

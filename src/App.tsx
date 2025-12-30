import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OrderProvider } from './context/OrderContext';

function App() {
  return (
    <ErrorBoundary>
      <OrderProvider>
        <Router>
          <AppRoutes />
        </Router>
      </OrderProvider>
    </ErrorBoundary>
  );
}

export default App;

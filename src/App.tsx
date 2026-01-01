import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OrderProvider } from './context/OrderContext';
import { DashboardCacheProvider } from './context/DashboardCacheContext';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <OrderProvider>
          <DashboardCacheProvider>
            <AppRoutes />
          </DashboardCacheProvider>
        </OrderProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

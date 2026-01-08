import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OrderProvider } from './context/OrderContext';
import { DashboardCacheProvider } from './context/DashboardCacheContext';
import { ChatProvider } from './context/ChatContext';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <UserProvider>
          <OrderProvider>
            <DashboardCacheProvider>
              <ChatProvider>
                <AppRoutes />
              </ChatProvider>
            </DashboardCacheProvider>
          </OrderProvider>
        </UserProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

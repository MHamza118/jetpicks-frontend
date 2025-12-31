import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ProfileSetup from '../pages/profile/ProfileSetup';
import TravelAvailabilitySetup from '../pages/travel/TravelAvailabilitySetup';
import OrdererDashboard from '../pages/orderer/Dashboard';
import CreateOrder from '../pages/orderer/CreateOrder';
import CreateOrderStep2 from '../pages/orderer/CreateOrderStep2';
import CreateOrderStep3 from '../pages/orderer/CreateOrderStep3';
import CreateOrderStep4 from '../pages/orderer/CreateOrderStep4';
import PickerDashboard from '../pages/picker/Dashboard';
import PickerOrderDetails from '../pages/picker/OrderDetails';
import PickerCounterOffer from '../pages/picker/CounterOffer';
import JetPickerDetails from '../pages/orderer/JetPickerDetails';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            
            {/* Travel Availability - Used during signup and in dashboard */}
            <Route path="/travel-availability-setup" element={<TravelAvailabilitySetup />} />
            
            {/* Orderer Routes - Protected */}
            <Route 
              path="/orderer/dashboard" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrdererDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/create-order" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <CreateOrder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/create-order-step2" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <CreateOrderStep2 />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/create-order-step3" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <CreateOrderStep3 />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/create-order-step4" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <CreateOrderStep4 />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/jetpicker-details" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <JetPickerDetails />
                </ProtectedRoute>
              } 
            />

            {/* Picker Routes - Protected */}
            <Route 
              path="/picker/dashboard" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PickerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/orders/:orderId" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PickerOrderDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/orders/:orderId/counter-offer" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PickerCounterOffer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/create-journey" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <TravelAvailabilitySetup />
                </ProtectedRoute>
              } 
            />
        </Routes>
    );
};

export default AppRoutes;

import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ProfileSetup from '../pages/profile/ProfileSetup';
import TravelAvailabilitySetup from '../pages/travel/TravelAvailabilitySetup';
import OrdererDashboard from '../pages/orderer/Dashboard';
import OrdererMyOrders from '../pages/orderer/MyOrders';
import OrdererOrderDetailsView from '../pages/orderer/OrderDetailsView';
import OrdererProfile from '../pages/orderer/Profile';
import OrdererPersonalInformation from '../pages/orderer/PersonalInformation';
import OrdererSettings from '../pages/orderer/Settings';
import CreateOrder from '../pages/orderer/CreateOrder';
import CreateOrderStep2 from '../pages/orderer/CreateOrderStep2';
import CreateOrderStep3 from '../pages/orderer/CreateOrderStep3';
import CreateOrderStep4 from '../pages/orderer/CreateOrderStep4';
import OrderAccepted from '../pages/orderer/OrderAccepted';
import CounterOfferReceived from '../pages/orderer/CounterOfferReceived';
import OrdererChat from '../pages/orderer/Chat';
import PickerDashboard from '../pages/picker/Dashboard';
import PickerMyOrders from '../pages/picker/MyOrders';
import PickerOrderDetails from '../pages/picker/OrderDetails';
import PickerOrderDetailsView from '../pages/picker/OrderDetailsView';
import PickerCounterOffer from '../pages/picker/CounterOffer';
import PickerChat from '../pages/picker/Chat';
import PickerProfile from '../pages/picker/Profile';
import PersonalInformation from '../pages/picker/PersonalInformation';
import TravelDetails from '../pages/picker/TravelDetails';
import Settings from '../pages/picker/Settings';
import PayoutMethods from '../pages/picker/PayoutMethods';
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
              path="/orderer/my-orders" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrdererMyOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/profile" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrdererProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/profile/personal" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrdererPersonalInformation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/profile/settings" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrdererSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/orders/:orderId" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrdererOrderDetailsView />
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
            <Route 
              path="/orderer/order-accepted/:orderId" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrderAccepted />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/counter-offer-received/:orderId/:offerId" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <CounterOfferReceived />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/chat" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrdererChat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orderer/chat/:roomId" 
              element={
                <ProtectedRoute requiredRole="ORDERER">
                  <OrdererChat />
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
              path="/picker/my-orders" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PickerMyOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/profile" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PickerProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/profile/personal" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PersonalInformation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/profile/travel" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <TravelDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/profile/settings" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/profile/payout" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PayoutMethods />
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
              path="/picker/orders/:orderId/view" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PickerOrderDetailsView />
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
            <Route 
              path="/picker/chat" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PickerChat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/picker/chat/:roomId" 
              element={
                <ProtectedRoute requiredRole="PICKER">
                  <PickerChat />
                </ProtectedRoute>
              } 
            />
        </Routes>
    );
};

export default AppRoutes;

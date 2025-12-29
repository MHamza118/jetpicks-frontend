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
import JetPickerDetails from '../pages/orderer/JetPickerDetails';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/travel-availability-setup" element={<TravelAvailabilitySetup />} />
            <Route path="/orderer/dashboard" element={<OrdererDashboard />} />
            <Route path="/orderer/create-order" element={<CreateOrder />} />
            <Route path="/orderer/create-order-step2" element={<CreateOrderStep2 />} />
            <Route path="/orderer/create-order-step3" element={<CreateOrderStep3 />} />
            <Route path="/orderer/create-order-step4" element={<CreateOrderStep4 />} />
            <Route path="/orderer/jetpicker-details" element={<JetPickerDetails />} />
            <Route path="/picker/dashboard" element={<PickerDashboard />} />
        </Routes>
    );
};

export default AppRoutes;

import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ProfileSetup from '../pages/profile/ProfileSetup';
import TravelAvailabilitySetup from '../pages/travel/TravelAvailabilitySetup';
import OrdererDashboard from '../pages/orderer/Dashboard';
import PickerDashboard from '../pages/picker/Dashboard';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/travel-availability-setup" element={<TravelAvailabilitySetup />} />
            <Route path="/orderer/dashboard" element={<OrdererDashboard />} />
            <Route path="/picker/dashboard" element={<PickerDashboard />} />
        </Routes>
    );
};

export default AppRoutes;

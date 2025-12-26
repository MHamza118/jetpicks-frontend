import { Routes, Route } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
import Signup from '../features/auth/pages/Signup';
import ProfileSetup from '../features/profile/pages/ProfileSetup';
import TravelAvailabilitySetup from '../features/travel/pages/TravelAvailabilitySetup';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/travel-availability-setup" element={<TravelAvailabilitySetup />} />
        </Routes>
    );
};

export default AppRoutes;

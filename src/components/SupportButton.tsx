import { Headphones } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const SupportButton = () => {
    const location = useLocation();
    const supportEmail = 'devfspro@gmail.com';
    const subject = 'Support Request - JetPicker';
    const body = 'Hello,\n\nI need assistance with:\n\n';

    // Determine if user is picker or orderer based on route
    const isPicker = location.pathname.includes('/picker');
    const buttonColor = isPicker ? 'bg-[#4D0013] hover:bg-[#660019]' : 'bg-[#FFDF57] hover:bg-yellow-500';
    const buttonTextColor = isPicker ? 'text-white' : 'text-gray-900';

    // Hide support button on these pages
    const hiddenPages = [
        '/',
        '/login',
        '/signup',
        '/profile-setup',
        '/travel-availability-setup',
        '/forgot-password',
        '/reset-password',
    ];

    // Hide from chat pages (both orderer and picker)
    const isChatPage = location.pathname.includes('/chat/');

    const shouldHide = hiddenPages.includes(location.pathname) || isChatPage;

    if (shouldHide) {
        return null;
    }

    const handleSupportClick = () => {
        // Open Gmail compose in new tab
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
    };

    return (
        <button
            onClick={handleSupportClick}
            className={`fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-5 md:right-5 lg:bottom-6 lg:right-6 ${buttonColor} ${buttonTextColor} rounded-full p-2.5 sm:p-3 md:p-3.5 lg:p-4 shadow-lg transition-all duration-300 hover:scale-110 z-40 flex items-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 group`}
            title="Contact Support"
        >
            <Headphones size={16} className="sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" />
            <span className="hidden group-hover:inline text-xs sm:text-xs md:text-sm lg:text-base font-semibold whitespace-nowrap">Support</span>
        </button>
    );
};

export default SupportButton;

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Linear gradient replaced with CSS gradients
import { X, Loader2 } from 'lucide-react';
import './Auth.css'; // You'll need to create this for custom styles

const OnBoardingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Carousel data
  const carouselImages = [
    { id: 1, title: "Welcome to Our Platform", bgColor: "#DCEAF7" },
    { id: 2, title: "Manage Your Sales", bgColor: "#E8F5E8" },
    { id: 3, title: "Track Your Progress", bgColor: "#FFF2E8" },
    { id: 4, title: "Connect with Clients", bgColor: "#F3E8FF" },
    { id: 5, title: "Grow Your Business", bgColor: "#FFE8F0" }
  ];

  const handleScroll = (event) => {
    const scrollPosition = event.target.scrollLeft;
    const index = Math.round(scrollPosition / window.innerWidth);
    setCurrentIndex(index);
  };

  const showToast = (message) => {
    // Using browser's alert for simplicity, you can replace with a toast library
    alert(message);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleLogin = async () => {
    if (!loginInput.trim()) {
      alert('Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    
    try {
      let apiUrl = 'https://sg76vqy4vi.execute-api.ap-south-1.amazonaws.com/salesapp/Auth?';
      
      if (isValidEmail(loginInput)) {
        apiUrl += `Email=${encodeURIComponent(loginInput)}`;
      } else if (isValidPhone(loginInput)) {
        apiUrl += `Phone=${encodeURIComponent(loginInput)}`;
      } else {
        alert('Please enter a valid email or phone number');
        setIsLoading(false);
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        if (Array.isArray(result) && result.length === 0) {
          alert('No account found with this email/phone. Please create an account first.');
        } else if (result && (Array.isArray(result) ? result.length > 0 : Object.keys(result).length > 0)) {
          // Profile found, store to localStorage and navigate
          localStorage.setItem('userProfile', JSON.stringify(result));
          localStorage.setItem('isAuthenticated', 'true');
          
          showToast('Login successful!');
          setShowLoginModal(false);
          navigate('/');
        } else {
          alert('Invalid response from server');
        }
      } else {
        alert(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please check your connection and try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        className="rounded-b-3xl px-5 "
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
        }}
      >
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold text-white">Journey Routers</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="px-4 py-2 rounded-full bg-white/20 text-white font-medium"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="px-4 py-2 rounded-full bg-white/20 text-white font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Full Height Carousel */}
      <div className="relative h-[calc(100vh-200px)]">
        <div
          ref={scrollViewRef}
          className="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
          onScroll={handleScroll}
        >
          {carouselImages.map((item, index) => (
            <div 
              key={item.id} 
              className="w-full flex-shrink-0 snap-start px-5 flex flex-col items-center justify-center"
              style={{ width: '100%' }}
            >
              <h2 className="text-3xl font-extrabold text-gray-900 mt-6 text-center">Get Started Today</h2>
              <p className="text-gray-500 mt-2 text-center">Join thousands of users already using our platform</p>

              {/* Hero Card */}
              <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 w-full max-w-md">
                <div 
                  className="rounded-xl flex items-center justify-center h-64" 
                  style={{ backgroundColor: item.bgColor }}
                >
                  <div className="w-24 h-44 bg-white rounded-3xl flex items-center justify-center shadow" />
                </div>
                <p className="mt-4 text-center text-gray-800 font-medium">{item.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-2 pb-4 absolute bottom-0 left-0 right-0">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({
                    left: window.innerWidth * index,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-purple-500' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Login</h2>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Email or Phone Number</label>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Enter your email or phone number"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full text-white font-semibold py-4 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(90deg, #7c3aed 0%, #5b21b6 100%)'
                }}
              >
                {isLoading && <Loader2 className="animate-spin mr-2" size={20} />}
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/signup');
                }}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-full hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                Create New Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnBoardingPage;
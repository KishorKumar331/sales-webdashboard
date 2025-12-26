import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Plus, Bell } from 'lucide-react';

const Navbar = ({
  title,
  subtitle,
  showSearch = true,
  showNotifications = true,
  showBack = false,
  onBackPress,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        borderRadius: '0 0 24px 24px',
        padding: '16px',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        marginBottom: '16px',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        {showSearch && !showBack && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '9999px',
            padding: '8px 16px',
            flex: 1,
            marginRight: '16px',
          }}>
            <Search color="white" size={20} />
            <input
              type="text"
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder={!isSearchFocused ? 'Search' : 'Search TripId'}
              style={{
                color: 'white',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                marginLeft: '8px',
                width: '100%',
                fontSize: '16px',
              }}
              placeholderStyle={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            />
          </div>
        )}

        {showBack && (
          <button 
            onClick={onBackPress}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              padding: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
            }}
          >
            <ArrowLeft color="white" size={24} />
          </button>
        )}

        {!showSearch && !showBack && <div style={{ flex: 1 }} />}

        <button 
          onClick={() => navigate('/new-lead')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '9999px',
            padding: '12px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
          }}
        >
          <Plus color="white" size={24} />
        </button>

        {showNotifications && (
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              padding: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Bell color="white" size={24} />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#EF4444',
              color: 'white',
              borderRadius: '9999px',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              3
            </span>
          </button>
        )}
      </div>

      {(title || subtitle) && (
        <div>
          {title && (
            <h1 style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
            }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              margin: '4px 0 0 0',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;

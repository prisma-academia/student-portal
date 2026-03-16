import { useState, useEffect } from 'react';
import { Button } from '@mui/joy';
import ChatIcon from '@mui/icons-material/Chat';
import { useChatStore } from './chatStore';

// Define keyframe animations
// const pulse = keyframes`
//   0% {
//     box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.7);
//   }
//   70% {
//     box-shadow: 0 0 0 10px rgba(66, 153, 225, 0);
//   }
//   100% {
//     box-shadow: 0 0 0 0 rgba(66, 153, 225, 0);
//   }
// `;

const FloatingButton = () => {
  const { toggleChat } = useChatStore();
  const [hover, setHover] = useState(false);

  // Animation to draw attention after component mounts
  const [initialAnimation, setInitialAnimation] = useState(false);
  
  useEffect(() => {
    // Start initial animation after a delay
    const timer = setTimeout(() => {
      setInitialAnimation(true);
      
      // End initial animation after a few seconds
      const endTimer = setTimeout(() => {
        setInitialAnimation(false);
      }, 3000);
      
      return () => clearTimeout(endTimer);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Button
      color="primary"
      aria-label="Chat with AI"
      onClick={toggleChat}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      size="lg"
      sx={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        transform: hover ? 'scale(1.1)' : 'scale(1)',
        // animation: initialAnimation ? `${pulse} 1.5s infinite` : 'none',
        boxShadow: hover 
          ? '0 0 20px rgba(66, 153, 225, 0.7)'
          : '0 0 10px rgba(66, 153, 225, 0.4)',
        '&:hover': {
          backgroundColor: 'primary.600',
        }
      }}
    >
      <ChatIcon />
    </Button>
  );
};

export default FloatingButton; 
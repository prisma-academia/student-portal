import { useState, useRef, useEffect } from 'react';
import { 
  Modal, 
  ModalDialog, 
  ModalClose, 
  Box, 
  Sheet, 
  Input, 
  IconButton, 
  Typography,
  Divider,
  CircularProgress,
  useColorScheme
} from '@mui/joy';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useChatStore } from './chatStore';
import { chatService } from './chatService';
import ChatMessage from './ChatMessage';
import ThreadSelector from './ThreadSelector';

const ChatModal = () => {
  const { 
    isOpen, 
    toggleChat, 
    threads, 
    currentThread, 
    addMessage, 
    isStreaming, 
    setStreaming,
    sendMessage
  } = useChatStore();
  
  const [inputMessage, setInputMessage] = useState('');
  const [currentAIMessage, setCurrentAIMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const { mode } = useColorScheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  
  // Get current thread messages
  const messages = threads[currentThread]?.messages || [];
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentAIMessage]);
  
  // Handle device orientation and resize
  useEffect(() => {
    const handleResize = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      if (window.innerWidth >= 900) { // md breakpoint
        setShowSidebar(false);
      }
      setIsMobile(window.innerWidth < 600);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  // Handle swipe gestures
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && showSidebar) {
      setShowSidebar(false);
    } else if (isRightSwipe && !showSidebar) {
      setShowSidebar(true);
    }
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    try {
      // Call the sendMessage method from our chat store
      await sendMessage(inputMessage);
      setInputMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Escape') {
      if (showSidebar) {
        setShowSidebar(false);
      } else {
        toggleChat();
      }
    }
  };
  
  useEffect(() => {
    // Add global event listener for keyboard shortcuts
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (showSidebar) {
          setShowSidebar(false);
        } else {
          toggleChat();
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, showSidebar, toggleChat]);
  
  return (
    <Modal
      open={isOpen}
      onClose={toggleChat}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ModalDialog
        ref={modalRef}
        layout="fullscreen"
        size="lg"
        variant="outlined"
        sx={{
          borderRadius: { xs: 0, sm: 'md' },
          maxWidth: { xs: '100%', sm: '600px', md: '900px' },
          maxHeight: { xs: '100vh', sm: '90vh', md: '80vh' },
          width: { xs: '100%', sm: '90%' },
          height: { xs: '100%', sm: '90%', md: '80%' },
          overflow: 'hidden',
          p: 0,
          boxShadow: { xs: 'none', sm: 'lg' },
          m: { xs: 0, sm: 'auto' },
          animation: { xs: 'slideUp 0.3s ease-out', sm: 'fadeIn 0.3s ease-out' },
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes slideUp': {
            from: { transform: 'translateY(100%)' },
            to: { transform: 'translateY(0)' }
          }
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          height: '100%',
          position: 'relative'
        }}>
          {/* Mobile Sidebar Overlay */}
          {showSidebar && (
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0,0,0,0.5)',
                zIndex: 10,
                display: { xs: 'block', md: 'none' }
              }}
              onClick={toggleSidebar}
            />
          )}
          
          {/* Sidebar */}
          <Sheet 
            sx={{ 
              width: { xs: '80%', md: '260px' }, 
              height: '100%',
              p: 2, 
              borderRight: '1px solid',
              borderColor: 'divider',
              display: { xs: showSidebar ? 'block' : 'none', md: 'block' },
              position: { xs: 'absolute', md: 'relative' },
              zIndex: 20,
              left: 0,
              top: 0,
              transition: 'all 0.25s ease-in-out',
              transform: { 
                xs: showSidebar ? 'translateX(0)' : 'translateX(-100%)', 
                md: 'translateX(0)' 
              },
              boxShadow: { 
                xs: showSidebar ? '4px 0 8px rgba(0,0,0,0.1)' : 'none', 
                md: 'none' 
              },
              bgcolor: 'background.surface'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography level="title-md">Chats</Typography>
              <IconButton 
                size="sm" 
                variant="plain" 
                color="neutral" 
                onClick={toggleSidebar}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <ThreadSelector />
          </Sheet>
          
          {/* Main chat area */}
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              height: { xs: '100%', md: '100%' },
              position: 'relative',
              width: '100%',
            }}
          >
            <Box sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  size="sm" 
                  variant="plain" 
                  color="neutral" 
                  onClick={toggleSidebar}
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography level="title-lg">
                  {threads[currentThread]?.name || 'Chat'}
                </Typography>
              </Box>
              <ModalClose sx={{ position: 'static' }} />
            </Box>
            
            {/* Messages area */}
            <Box 
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                flexGrow: 1, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
                msOverflowStyle: 'none', // Hide scrollbar on IE/Edge
                scrollbarWidth: 'thin', // Firefox
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '3px',
                },
              }}
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    opacity: 0.7
                  }}
                >
                  <Typography level="body-lg" sx={{ mb: 2 }}>
                    Ask me anything! I'm here to help.
                  </Typography>
                </Box>
              ) : (
                messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    isStreaming={isStreaming}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>
            
            {/* Input area */}
            <Box 
              sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                background: 'background.surface'
              }}
            >
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ 
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  width: '100%'
                }}
              >
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  multiline
                  minRows={1}
                  maxRows={4}
                  aria-label="Chat message input"
                  slotProps={{
                    textarea: {
                      id: 'chat-message-input'
                    }
                  }}
                  endDecorator={
                    isStreaming ? (
                      <CircularProgress size="sm" />
                    ) : (
                      <IconButton 
                        type="submit"
                        color="primary"
                        disabled={!inputMessage.trim()}
                        aria-label="Send message"
                        sx={{ 
                          flexShrink: 0,
                          ml: { xs: 0.5, sm: 1 },
                          width: { xs: '36px', sm: '40px' },
                          height: { xs: '36px', sm: '40px' },
                        }}
                      >
                        <SendIcon fontSize={isMobile ? 'small' : 'medium'} />
                      </IconButton>
                    )
                  }
                  sx={{ 
                    flexGrow: 1,
                    transition: 'all 0.2s',
                    '--Input-focusedThickness': '2px',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    p: { xs: '8px 12px', sm: '10px 16px' },
                    borderRadius: '12px',
                    '&:focus-within': {
                      boxShadow: `0 0 0 3px ${mode === 'dark' ? 'rgba(66, 153, 225, 0.3)' : 'rgba(66, 153, 225, 0.2)'}`
                    },
                    '& textarea': {
                      lineHeight: 1.5,
                    }
                  }}
                />
              </form>
            </Box>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default ChatModal; 
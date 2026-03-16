import { useEffect } from 'react';
import FloatingButton from './FloatingButton';
import ChatModal from './ChatModal';
import { useChatStore } from './chatStore';

const AIChatInterface = () => {
  // Initialize chat interface with Mastra Memory API
  const { loadThreads } = useChatStore();
  
  useEffect(() => {
    // Load existing threads from Mastra Memory
    const initializeChat = async () => {
      try {
        await loadThreads();
        // We no longer create a default thread here
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };
    
    initializeChat();
  }, []);
  
  return (
    <>
      <FloatingButton />
      <ChatModal />
    </>
  );
};

export default AIChatInterface; 
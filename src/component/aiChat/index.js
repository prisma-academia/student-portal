// Export the main interface component as the default export
export { default } from './AIChatInterface';

// Export individual components and services
export { default as ChatModal } from './ChatModal';
export { default as FloatingButton } from './FloatingButton';
export { default as ChatMessage } from './ChatMessage';
export { default as ThreadSelector } from './ThreadSelector';
export { chatService } from './chatService';
export { useChatStore } from './chatStore'; 
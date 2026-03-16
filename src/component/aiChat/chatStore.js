import { create } from 'zustand';
import { chatService } from './chatService';

export const useChatStore = create((set, get) => ({
  // UI state
  isOpen: false,
  isStreaming: false,
  
  // Data
  threads: {},
  currentThread: null,
  
  // Actions
  toggleChat: () => set(state => ({ isOpen: !state.isOpen })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  
  // Thread actions
  setCurrentThread: (threadId) => set({ currentThread: threadId }),
  
  loadThreads: async () => {
    try {
      const threadList = await chatService.getThreads();
      const threadsMap = {};
      
      // Convert array to map for quick access
      threadList.forEach(thread => {
        threadsMap[thread.id] = {
          id: thread.id,
          name: thread.title,
          metadata: thread.metadata,
          messages: [],
          createdAt: thread.createdAt
        };
      });
      
      set({ threads: threadsMap });
      
      // Set current thread to first thread if none selected
      if (!get().currentThread && threadList.length > 0) {
        set({ currentThread: threadList[0].id });
      }
      
      return threadList;
    } catch (error) {
      console.error("Failed to load threads:", error);
      return [];
    }
  },
  
  createThread: async (title, metadata = {}) => {
    try {
      const newThread = await chatService.createThread(title, metadata);
      
      set(state => ({
        threads: {
          ...state.threads,
          [newThread.id]: {
            id: newThread.id,
            name: newThread.title,
            metadata: newThread.metadata,
            messages: [],
            createdAt: newThread.createdAt
          }
        },
        currentThread: newThread.id
      }));
      
      return newThread.id;
    } catch (error) {
      console.error("Failed to create thread:", error);
      return null;
    }
  },
  
  updateThread: async (threadId, updates) => {
    try {
      const updated = await chatService.updateThread(threadId, updates);
      
      set(state => ({
        threads: {
          ...state.threads,
          [threadId]: {
            ...state.threads[threadId],
            name: updates.title || state.threads[threadId].name,
            metadata: updates.metadata || state.threads[threadId].metadata
          }
        }
      }));
      
      return updated;
    } catch (error) {
      console.error("Failed to update thread:", error);
      return null;
    }
  },
  
  deleteThread: async (threadId) => {
    try {
      await chatService.deleteThread(threadId);
      
      // Remove thread from state
      const { [threadId]: threadToRemove, ...remainingThreads } = get().threads;
      
      // If current thread is deleted, switch to another thread
      let newCurrentThread = get().currentThread;
      if (newCurrentThread === threadId) {
        const threadIds = Object.keys(remainingThreads);
        newCurrentThread = threadIds.length > 0 ? threadIds[0] : null;
      }
      
      set({
        threads: remainingThreads,
        currentThread: newCurrentThread
      });
      
      return true;
    } catch (error) {
      console.error("Failed to delete thread:", error);
      return false;
    }
  },
  
  // Message actions
  addMessage: (message) => {
    // Add message to local state
    set(state => {
      const threadId = message.threadId || state.currentThread;
      if (!threadId) return state; // No thread selected
      
      const thread = state.threads[threadId];
      if (!thread) return state; // Thread doesn't exist
      
      return {
        threads: {
          ...state.threads,
          [threadId]: {
            ...thread,
            messages: [...thread.messages, message]
          }
        }
      };
    });
    
    // Save message to memory
    const threadId = message.threadId || get().currentThread;
    if (threadId) {
      chatService.saveMessages([message], threadId).catch(error => {
        console.error("Failed to save message to memory:", error);
      });
    }
  },
  
  sendMessage: async (text) => {
    let threadId = get().currentThread;
    
    // Create a new thread if none exists
    if (!threadId) {
      // Create a thread name from the user's message (truncate if too long)
      const threadName = text.length > 30 ? `${text.substring(0, 30)}...` : text;
      threadId = await get().createThread(threadName, { category: 'general' });
      if (!threadId) return null; // Failed to create thread
    }
    
    // Add user message to UI
    const userMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
      threadId
    };
    
    get().addMessage(userMessage);
    
    try {
      // Start streaming
      set({ isStreaming: true });
      
      // Create placeholder for AI response
      const aiMessageId = `ai-${Date.now()}`;
      const aiMessage = {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        threadId,
        isStreaming: true
      };
      
      get().addMessage(aiMessage);
      
      // Get response stream
      const response = await chatService.sendMessage(text, threadId);
      
      // Process stream
      let fullResponse = '';
      
      await chatService.processStreamResponse(
        response,
        // On chunk received
        (chunk) => {
          fullResponse += chunk;
          set(state => {
            const thread = state.threads[threadId];
            if (!thread) return state;
            
            const messageIndex = thread.messages.findIndex(m => m.id === aiMessageId);
            if (messageIndex === -1) return state;
            
            const updatedMessages = [...thread.messages];
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              text: fullResponse
            };
            
            return {
              threads: {
                ...state.threads,
                [threadId]: {
                  ...thread,
                  messages: updatedMessages
                }
              }
            };
          });
        },
        // On complete
        (finalResponse) => {
          set(state => {
            const thread = state.threads[threadId];
            if (!thread) return state;
            
            const messageIndex = thread.messages.findIndex(m => m.id === aiMessageId);
            if (messageIndex === -1) return state;
            
            const updatedMessages = [...thread.messages];
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              text: finalResponse,
              isStreaming: false
            };
            
            return {
              threads: {
                ...state.threads,
                [threadId]: {
                  ...thread,
                  messages: updatedMessages
                }
              },
              isStreaming: false
            };
          });
          
          // Save final AI message to memory
          const finalAiMessage = {
            id: aiMessageId,
            text: finalResponse,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            threadId
          };
          
          chatService.saveMessages([finalAiMessage], threadId).catch(error => {
            console.error("Failed to save AI message to memory:", error);
          });
        }
      );
      
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Update streaming state
      set({ isStreaming: false });
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: "Sorry, there was an error processing your request. Please try again.",
        sender: 'system',
        timestamp: new Date().toISOString(),
        threadId,
        error: true
      };
      
      get().addMessage(errorMessage);
      
      return false;
    }
  }
})); 
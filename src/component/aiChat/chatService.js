import { MastraClient } from "@mastra/client-js";
import { useAuthStore } from "../../store";
import { CleanHands } from "@mui/icons-material";

class ChatService {
  constructor() {
    this.client = new MastraClient({
      baseUrl: "http://localhost:4111", // Default Mastra development server port
    });
    this.agentId = "weatherAgent"; // Default agent ID
    this.resourceId = useAuthStore.getState().user?._id || ""; // Default resource ID
  }

  // Thread operations
  async getThreads() {
    try {
      const threads = await this.client.getMemoryThreads({
        resourceId: this.resourceId,
        agentId: this.agentId
      });
      return threads;
    } catch (error) {
      console.error("Error fetching threads:", error);
      throw error;
    }
  }

  async createThread(title, metadata = {}) {
    try {
      const thread = await this.client.createMemoryThread({
        title,
        metadata,
        resourceid: this.resourceId,
        agentId: this.agentId
      });
      return thread;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    }
  }

  getThread(threadId) {
    return this.client.getMemoryThread(threadId, this.agentId);
  }

  async updateThread(threadId, updates) {
    try {
      const thread = this.getThread(threadId);
      const updated = await thread.update({
        ...updates,
        resourceId: this.resourceId,
      });
      return updated;
    } catch (error) {
      console.error("Error updating thread:", error);
      throw error;
    }
  }

  async deleteThread(threadId) {
    try {
      const thread = this.getThread(threadId);
      await thread.delete();
      return true;
    } catch (error) {
      console.error("Error deleting thread:", error);
      throw error;
    }
  }

  // Message operations
  async saveMessages(messages, threadId) {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        id: msg.id,
        threadId,
        createdAt: new Date(msg.timestamp || Date.now()),
        type: "text",
      }));

      const savedMessages = await this.client.saveMessageToMemory({
        messages: formattedMessages,
        agentId: this.agentId
      });
      
      return savedMessages;
    } catch (error) {
      console.error("Error saving messages:", error);
      throw error;
    }
  }

  async getMemoryStatus() {
    try {
      const status = await this.client.getMemoryStatus(this.agentId);
      return status;
    } catch (error) {
      console.error("Error getting memory status:", error);
      throw error;
    }
  }

  // Send message and get streaming response
  async sendMessage(message, threadId) {
    try {
      const agent = this.client.getAgent(this.agentId);
      
      // Format the message for the API
      const apiMessage = {
        role: "user",
        content: message,
        threadId
      };
      
      // Get streaming response
      const response = await agent.stream({
        messages: [apiMessage],
      });
      
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Process streaming response
  async processStreamResponse(response, onChunk, onComplete) {
    try {
      const reader = response.body.getReader();
      let fullResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        fullResponse += this.parseResponseChunk(chunk)
        
        if (onChunk && typeof onChunk === 'function') {
          onChunk(this.parseResponseChunk(chunk));
        }
      }
      
      if (onComplete && typeof onComplete === 'function') {
        onComplete(fullResponse);
      }
      return fullResponse;
    } catch (error) {
      console.error("Error processing stream:", error);
      throw error;
    }
  }
  
  // Helper method to parse response chunks and extract clean text
  parseResponseChunk(chunk) {
    try {
      // Extract content from chunks with key "0", preserving Markdown syntax
      const lines = chunk.split('\n');
      let result = '';
      
      for (const line of lines) {
        // Match lines that start with 0:" and extract the content
        // Using a regex that preserves all special characters
        const match = line.match(/^0:"(.*)"$/);
        if (match) {
          // Replace escaped characters to preserve Markdown
          const unescaped = match[1]
            .replace(/\\n/g, '\n')     // Newlines
            .replace(/\\"/g, '"')      // Quotes
            .replace(/\\\\/g, '\\')    // Backslashes
            .replace(/\\t/g, '\t');    // Tabs
          
          result += unescaped;
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error parsing response chunk:", error);
      return chunk; // Return the original chunk if parsing fails
    }
  }
}

// Export a singleton instance
export const chatService = new ChatService();
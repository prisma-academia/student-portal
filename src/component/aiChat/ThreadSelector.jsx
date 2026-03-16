import { useState, useEffect } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemContent,
  IconButton,
  Divider,
  Button,
  Typography,
  Input,
  Modal,
  ModalDialog,
  ModalClose,
  CircularProgress
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import { useChatStore } from './chatStore';

const ThreadSelector = () => {
  const { 
    threads, 
    currentThread, 
    setCurrentThread, 
    createThread,
    deleteThread,
    loadThreads
  } = useChatStore();
  
  const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState(null);
  const [newThreadName, setNewThreadName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load threads on initial render
  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        await loadThreads();
      } catch (error) {
        console.error("Error loading threads:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThreads();
  }, [loadThreads]);
  
  const handleCreateThread = async () => {
    if (newThreadName.trim()) {
      setIsLoading(true);
      try {
        await createThread(newThreadName);
        setNewThreadName('');
        setIsNewThreadModalOpen(false);
      } catch (error) {
        console.error("Error creating thread:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const openDeleteModal = (threadId, e) => {
    e.stopPropagation();
    setThreadToDelete(threadId);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteThread = async () => {
    if (!threadToDelete) return;
    
    setIsLoading(true);
    try {
      await deleteThread(threadToDelete);
      setIsDeleteModalOpen(false);
      setThreadToDelete(null);
    } catch (error) {
      console.error("Error deleting thread:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography level="title-md" sx={{ mb: 1 }}>
          Conversations
        </Typography>
        
        <Button 
          startDecorator={isLoading ? <CircularProgress size="sm" /> : <AddIcon />}
          color="primary"
          variant="soft"
          onClick={() => setIsNewThreadModalOpen(true)}
          fullWidth
          sx={{ mb: 2 }}
          disabled={isLoading}
        >
          New Chat
        </Button>
        
        <Divider />
        
        {isLoading && Object.keys(threads).length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size="sm" />
          </Box>
        ) : (
          <List size="sm" sx={{ 
            '--ListItem-radius': '8px',
            '--ListItemDecorator-size': '32px',
            mt: 1
          }}>
            {Object.values(threads).length === 0 ? (
              <Typography level="body-sm" sx={{ textAlign: 'center', my: 2, opacity: 0.7 }}>
                No conversations yet
              </Typography>
            ) : (
              Object.values(threads).map((thread) => (
                <ListItem key={thread.id}>
                  <ListItemButton 
                    selected={thread.id === currentThread}
                    onClick={() => setCurrentThread(thread.id)}
                    sx={{
                      transition: 'background-color 0.2s, transform 0.2s',
                      '&:hover': {
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <ListItemContent>
                      <Typography 
                        level="body-sm"
                        noWrap
                        sx={{ 
                          maxWidth: '150px',
                          textOverflow: 'ellipsis'  
                        }}
                      >
                        {thread.name}
                      </Typography>
                    </ListItemContent>
                    
                    <IconButton 
                      size="sm" 
                      variant="plain" 
                      color="neutral"
                      onClick={(e) => openDeleteModal(thread.id, e)}
                      disabled={isLoading}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        )}
      </Box>
      
      {/* New Thread Modal */}
      <Modal
        open={isNewThreadModalOpen}
        onClose={() => !isLoading && setIsNewThreadModalOpen(false)}
      >
        <ModalDialog
          aria-labelledby="new-thread-modal-title"
          size="sm"
        >
          <ModalClose disabled={isLoading} />
          <Typography id="new-thread-modal-title" level="h4" sx={{ mb: 2 }}>
            Create New Chat
          </Typography>
          
          <Input
            value={newThreadName}
            onChange={(e) => setNewThreadName(e.target.value)}
            placeholder="Enter a name for your chat"
            autoFocus
            sx={{ mb: 2 }}
            disabled={isLoading}
          />
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setIsNewThreadModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateThread} 
              disabled={!newThreadName.trim() || isLoading}
              endDecorator={isLoading && <CircularProgress size="sm" />}
            >
              Create
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => !isLoading && setIsDeleteModalOpen(false)}
      >
        <ModalDialog
          aria-labelledby="delete-confirmation-title"
          size="sm"
          variant="outlined"
          color="danger"
        >
          <ModalClose disabled={isLoading} />
          <Typography
            id="delete-confirmation-title"
            level="h4"
            startDecorator={<WarningIcon />}
            sx={{ mb: 2 }}
          >
            Delete Conversation
          </Typography>
          
          <Typography level="body-md" sx={{ mb: 3 }}>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button 
              variant="plain" 
              color="neutral" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="solid"
              color="danger"
              onClick={handleDeleteThread} 
              disabled={isLoading}
              endDecorator={isLoading && <CircularProgress size="sm" />}
            >
              Delete
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default ThreadSelector; 
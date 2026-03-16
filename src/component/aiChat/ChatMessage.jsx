import { useState, useEffect } from 'react';
import { Avatar, Box, Typography, Sheet, CircularProgress } from '@mui/joy';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/Info';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatMessage = ({ message, isStreaming }) => {
  const isAI = message.sender === 'ai';
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isError = message.error === true;
  
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [processedMarkdown, setProcessedMarkdown] = useState('');
  
  // Process markdown to fix common formatting issues
  const preprocessMarkdown = (text) => {
    if (!text) return '';
    
    // Fix code blocks that might be improperly formatted
    let processed = text
      // Ensure proper spacing for code blocks
      .replace(/```(\w+)(?!\n)/g, '```$1\n')
      // Ensure code blocks end with newline
      .replace(/```(?!\n)/g, '```\n')
      // Fix bullet lists without proper spacing
      .replace(/^([*\-+])(?!\s)/gm, '$1 ')
      // Fix numbered lists without proper spacing
      .replace(/^(\d+\.)(?!\s)/gm, '$1 ');
    
    return processed;
  };
  
  // Handle typing animation effect when message is streaming
  useEffect(() => {
    if (!isAI || !message.isStreaming || !isStreaming) {
      setTypedText(message.text);
      setIsTyping(false);
    } else {
      setIsTyping(true);
      setTypedText(message.text);
    }
    
    // Process markdown after text update
    setProcessedMarkdown(preprocessMarkdown(message.text));
  }, [message.text, isAI, message.isStreaming, isStreaming]);
  
  const getMessageIcon = () => {
    if (isAI) return <SmartToyIcon />;
    if (isUser) return <PersonIcon />;
    if (isError) return <ErrorOutlineIcon />;
    return <InfoIcon />;
  };
  
  const getMessageColor = () => {
    if (isAI) return 'primary';
    if (isUser) return 'neutral';
    if (isError) return 'danger';
    return 'neutral';
  };
  
  // Custom component renderers for Markdown
  const markdownComponents = {
    p: ({ children }) => <Typography level="body-sm" sx={{ my: 0.5, whiteSpace: 'pre-wrap' }}>{children}</Typography>,
    h1: ({ children }) => <Typography level="h1" sx={{ mt: 1, mb: 0.5 }}>{children}</Typography>,
    h2: ({ children }) => <Typography level="h2" sx={{ mt: 1, mb: 0.5 }}>{children}</Typography>,
    h3: ({ children }) => <Typography level="h3" sx={{ mt: 1, mb: 0.5 }}>{children}</Typography>,
    h4: ({ children }) => <Typography level="title-md" sx={{ mt: 1, mb: 0.5 }}>{children}</Typography>,
    ul: ({ children }) => <Box component="ul" sx={{ pl: 2, my: 0.5 }}>{children}</Box>,
    ol: ({ children }) => <Box component="ol" sx={{ pl: 2, my: 0.5 }}>{children}</Box>,
    li: ({ children }) => <Typography component="li" level="body-sm" sx={{ my: 0.25 }}>{children}</Typography>,
    table: ({ children }) => (
      <Box 
        sx={{ 
          overflowX: 'auto', 
          my: 1,
          maxWidth: '100%',
          '& table': {
            borderCollapse: 'collapse',
            width: '100%',
            fontSize: '0.875rem'
          }
        }}
      >
        <table>{children}</table>
      </Box>
    ),
    thead: ({ children }) => <thead style={{ borderBottom: '2px solid #ccc' }}>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <Box
        component="th"
        sx={{
          p: 1,
          fontWeight: 'bold',
          textAlign: 'left',
          borderBottom: '1px solid #ccc'
        }}
      >
        {children}
      </Box>
    ),
    td: ({ children }) => (
      <Box
        component="td"
        sx={{
          p: 1,
          borderBottom: '1px solid #ccc'
        }}
      >
        {children}
      </Box>
    ),
    blockquote: ({ children }) => (
      <Box
        component="blockquote"
        sx={{
          borderLeft: '3px solid',
          borderColor: 'primary.500',
          pl: 1.5,
          ml: 1,
          my: 1,
          color: 'text.secondary'
        }}
      >
        {children}
      </Box>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      return inline ? (
        <Typography 
          component="code" 
          sx={{ 
            backgroundColor: 'background.level2',
            p: 0.3,
            borderRadius: 'sm',
            fontFamily: 'monospace',
          }}
          {...props}
        >
          {children}
        </Typography>
      ) : (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language || 'text'}
          PreTag={Box}
          customStyle={{
            borderRadius: '8px',
            margin: '8px 0',
            fontSize: '0.875rem'
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    },
    img: ({ src, alt, ...props }) => (
      <Box 
        component="img" 
        src={src} 
        alt={alt || 'Image'} 
        sx={{ 
          maxWidth: '100%', 
          height: 'auto',
          borderRadius: 'md',
          my: 1
        }}
        {...props}
      />
    ),
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
        alignItems: 'flex-start',
        flexDirection: isUser ? 'row-reverse' : 'row',
        opacity: isStreaming && message.isStreaming ? 0.8 : 1,
        animation: message.isStreaming ? 'fadeIn 0.3s ease-in-out' : 'none',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 0.8 }
        }
      }}
    >
      <Avatar
        color={getMessageColor()}
        variant="soft"
        size="sm"
        sx={{ 
          mr: isUser ? 0 : 1,
          ml: isUser ? 1 : 0,
          mt: 0.5
        }}
      >
        {getMessageIcon()}
      </Avatar>
      
      <Sheet
        color={getMessageColor()}
        variant={isSystem ? 'outlined' : 'soft'}
        sx={{
          p: 1.5,
          borderRadius: '1rem',
          borderTopLeftRadius: isUser ? '1rem' : 0,
          borderTopRightRadius: isUser ? 0 : '1rem',
          maxWidth: isAI ? '85%' : '80%',
          width: 'auto',
          overflowX: 'auto',
          transition: 'all 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          position: 'relative',
          '& pre': {
            maxWidth: '100%',
            overflowX: 'auto'
          }
        }}
      >
        {isUser ? (
          <Typography level="body-sm">{typedText}</Typography>
        ) : (
          <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
            skipHtml={false}
          >
            {processedMarkdown}
          </ReactMarkdown>
        )}
        
        {isStreaming && message.isStreaming && (
          <Box component="span" sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            ml: 1,
            position: 'relative',
            top: '2px'
          }}>
            <CircularProgress size="sm" thickness={2} sx={{ fontSize: '0.75rem' }} />
          </Box>
        )}
        
        <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.7 }}>
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Typography>
      </Sheet>
    </Box>
  );
};

export default ChatMessage; 
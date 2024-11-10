import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const EditorContext = createContext();

export function EditorProvider({ children }) {
  // States
  const [content, setContent] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElAscii, setAnchorElAscii] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activePostId, setActivePostId] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [editorRef, setEditorRef] = useState(null);

  const { user } = useAuth();

  // Constants
  const MAX_LINE_LENGTH = 53;
  const MAX_TOTAL_LENGTH = 3000;

  const asciiCharacters = {
    // Aufzählungen
    bullet: '•',
    arrow: '↳',
    rightArrow: '→',
    doubleArrow: '⇒',
    checkmark: '☑',
    check: '✓',
    cross: '✗',
    star: '★',
    diamond: '◆',
    square: '■',
    circle: '●',
    
    // Trenner
    line: '____________',
    separator1: '-------------------',
    separator2: '• • •',
    separator3: '⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯',
    separator4: '══════════',
    separator5: '┈┈┈┈┈┈┈┈┈┈',
    separator6: '━━━━━━━━━━',
    longLine: '-------------------------------------------------------------------',
  };

  const italicMap = {
    'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪',
    'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳',
    's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻',
    'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏', 'I': '𝘐',
    'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙',
    'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡'
  };

  const boldMap = {
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶',
    'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿',
    's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
    'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
    'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭'
  };

  // Effects
  useEffect(() => {
    if (user) {
      fetchTemplates();
      fetchPosts();
    }
  }, [user]);

  // API Functions
  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/templates', {
        headers: {
          'user-id': user.uid
        }
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/posts', {
        headers: {
          'user-id': user.uid
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleTemplateChange = async (event) => {
    const templateId = event.target.value;
    if (!templateId) return;

    try {
      const response = await fetch(`http://localhost:5001/api/templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to load template');
      
      const template = await response.json();
      
      if (editorRef) {
        const start = editorRef.selectionStart;
        const end = editorRef.selectionEnd;
        const text = editorRef.value;
        
        const newContent = text.substring(0, start) + 
                          template.inhalt + 
                          text.substring(end);
        
        setContent(newContent);
        
        // Cursor nach dem eingefügten Template platzieren
        setTimeout(() => {
          editorRef.selectionStart = start + template.inhalt.length;
          editorRef.selectionEnd = start + template.inhalt.length;
          editorRef.focus();
        }, 0);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setSnackbarMessage('Fehler beim Laden des Templates');
      setOpenSnackbar(true);
    }
  };

  const handlePostChange = async (event) => {
    const postId = event.target.value;
    if (postId) {
      try {
        const response = await fetch(`http://localhost:5001/api/posts/${postId}`, {
          headers: {
            'user-id': user.uid
          }
        });
        if (!response.ok) {
          throw new Error('Post konnte nicht geladen werden');
        }
        const post = await response.json();
        processAIContent(post.content);
        setActivePostId(post._id);
        event.target.value = "";
        setSnackbarMessage('Post erfolgreich geladen');
        setOpenSnackbar(true);
      } catch (error) {
        console.error('Error loading post:', error);
        setSnackbarMessage('Fehler beim Laden des Posts');
        setOpenSnackbar(true);
      }
    }
  };

  const saveCurrentPost = async () => {
    try {
      const url = activePostId 
        ? `http://localhost:5001/api/posts/${activePostId}` 
        : 'http://localhost:5001/api/posts';
      
      const method = activePostId ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.uid
        },
        body: JSON.stringify({ 
          content,
          last_edited: new Date()
        })
      });

      setSnackbarMessage(activePostId ? 'Post erfolgreich aktualisiert' : 'Post erfolgreich gespeichert');
      setOpenSnackbar(true);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      setSnackbarMessage('Fehler beim Speichern');
      setOpenSnackbar(true);
    }
  };

  // Text Formatting Functions
  const convertToItalic = () => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const italicText = selectedText
      .split('')
      .map(char => italicMap[char] || char)
      .join('');
    
    const newContent = content.substring(0, start) + italicText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + italicText.length;
      textarea.focus();
    }, 0);
  };

  const convertToBold = () => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const boldText = selectedText
      .split('')
      .map(char => boldMap[char] || char)
      .join('');
    
    const newContent = content.substring(0, start) + boldText + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + boldText.length;
      textarea.focus();
    }, 0);
  };

  // Emoji and ASCII Functions
  const handleEmojiClick = (emojiData) => {
    insertAtCursor(emojiData.emoji);
    setAnchorEl(null);
  };

  const handleAsciiClick = (char) => {
    insertAtCursor(char);
    setAnchorElAscii(null);
  };

  const insertAtCursor = (char) => {
    const textarea = document.getElementById('content-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + char + content.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + char.length;
      textarea.focus();
    }, 0);
  };

  // Content Management Functions
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    
    if (newContent.length > MAX_TOTAL_LENGTH) {
      setSnackbarMessage(`Maximale Zeichenanzahl (${MAX_TOTAL_LENGTH}) erreicht`);
      setOpenSnackbar(true);
      return;
    }

    setContent(newContent);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setSnackbarMessage('Text erfolgreich kopiert');
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setSnackbarMessage('Fehler beim Kopieren');
      setOpenSnackbar(true);
    }
  };

  const processAIContent = (aiContent) => {
    console.log('Processing AI content:', aiContent); // Debug log
    
    if (!aiContent) {
      console.warn('No AI content to process');
      return;
    }

    const lines = aiContent.split('\n');
    
    const processedLines = lines.map(line => {
      const chunks = [];
      for (let i = 0; i < line.length; i += MAX_LINE_LENGTH) {
        const chunk = line.slice(i, i + MAX_LINE_LENGTH);
        if (i + MAX_LINE_LENGTH < line.length) {
          const lastSpace = chunk.lastIndexOf(' ');
          if (lastSpace !== -1) {
            chunks.push(line.slice(i, i + lastSpace));
            i = i + lastSpace - MAX_LINE_LENGTH;
          } else {
            chunks.push(chunk);
          }
        } else {
          chunks.push(chunk);
        }
      }
      return chunks.join('\n');
    });

    const finalContent = processedLines.join('\n');
    console.log('Setting processed content:', finalContent); // Debug log
    setContent(finalContent);
  };

  const handleNewPost = () => {
    setContent('');
    setActivePostId(null);
  };

  // Utility Functions
  const getWordCount = () => {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = () => {
    if (!content) return 0;
    return content.length;
  };

  const getCurrentLineLength = () => {
    const textarea = document.getElementById('content-textarea');
    if (!textarea) return 0;
    
    const cursorPosition = textarea.selectionStart;
    const contentUpToCursor = textarea.value.substring(0, cursorPosition);
    const lastNewlineIndex = contentUpToCursor.lastIndexOf('\n');
    const currentLine = contentUpToCursor.substring(lastNewlineIndex + 1);
    
    return currentLine.length;
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX + 2, mouseY: event.clientY - 6 }
        : null
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const transformText = async (type) => {
    try {
      // Hole den selektierten Text aus dem Textarea
      const textarea = document.getElementById('content-textarea');
      const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );

      if (!selectedText) {
        setSnackbarMessage('Bitte wähle zuerst einen Text aus');
        setOpenSnackbar(true);
        return;
      }

      setIsProcessing(true);

      const response = await fetch('http://localhost:5001/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          type: type, // 'Shorten', 'Extend', oder 'Rephrase'
          additionalParams: {} // Leeres Objekt, da keine zusätzlichen Parameter benötigt
        })
      });

      if (!response.ok) {
        throw new Error('Transform request failed');
      }

      const data = await response.json();
      
      // Ersetze den selektierten Text mit dem transformierten Text
      const newContent = 
        content.substring(0, textarea.selectionStart) +
        data.transformedText +
        content.substring(textarea.selectionEnd);
      
      setContent(newContent);
      setSnackbarMessage('Text erfolgreich transformiert');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error transforming text:', error);
      setSnackbarMessage('Fehler bei der Transformation');
      setOpenSnackbar(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const loadPost = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}`);
      if (!response.ok) throw new Error('Failed to load post');
      
      const post = await response.json();
      setContent(post.content);
      setCurrentPostId(postId); // Speichere die aktuelle Post-ID
    } catch (error) {
      console.error('Error loading post:', error);
      setSnackbarMessage('Fehler beim Laden des Posts');
      setOpenSnackbar(true);
    }
  };

  const saveContent = async () => {
    try {
      setIsProcessing(true);
      
      const url = currentPostId 
        ? `http://localhost:5001/api/posts/${currentPostId}` // Update
        : 'http://localhost:5001/api/posts'; // Neue Anlage
      
      const method = currentPostId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) throw new Error('Failed to save post');
      
      const savedPost = await response.json();
      if (!currentPostId) {
        setCurrentPostId(savedPost.id); // Setze ID bei Neuanlage
      }

      setSnackbarMessage('Post erfolgreich gespeichert');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error saving post:', error);
      setSnackbarMessage('Fehler beim Speichern');
      setOpenSnackbar(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const insertText = (text) => {
    if (!text) return;
    
    const textarea = document.getElementById('content-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = content || '';
    
    const newContent = 
      currentContent.substring(0, start) + 
      text + 
      currentContent.substring(end);
    
    setContent(newContent);
    
    // Cursor nach dem eingefügten Text positionieren
    setTimeout(() => {
      textarea.selectionStart = start + text.length;
      textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  // Funktion zum Neuladen der Templates
  const refreshTemplates = () => {
    fetchTemplates();
  };

  const value = {
    // States
    content,
    setContent,
    openSnackbar,
    snackbarMessage,
    anchorEl,
    setAnchorEl,
    anchorElAscii,
    setAnchorElAscii,
    contextMenu,
    isLoading,
    isProcessing,
    setIsProcessing,
    templates,
    posts,
    activePostId,
    currentPostId,
    editorRef,
    setEditorRef,

    // Constants
    MAX_LINE_LENGTH,
    MAX_TOTAL_LENGTH,
    asciiCharacters,
    italicMap,
    boldMap,

    // Functions
    fetchTemplates,
    fetchPosts,
    handleTemplateChange,
    handlePostChange,
    saveCurrentPost,
    convertToItalic,
    convertToBold,
    handleEmojiClick,
    handleAsciiClick,
    insertAtCursor,
    handleContentChange,
    handleCopy,
    processAIContent,
    handleNewPost,
    getWordCount,
    getCharCount,
    getCurrentLineLength,
    handleContextMenu,
    handleClose,
    transformText,
    handleCloseSnackbar,
    loadPost,
    saveContent,
    insertText,
    refreshTemplates,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export const useEditorContext = () => useContext(EditorContext); 
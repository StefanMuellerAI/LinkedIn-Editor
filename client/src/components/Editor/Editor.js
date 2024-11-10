import React, { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import EditorMain from './EditorMain';
import EditorSidebar from './EditorSidebar';
import EditorContextMenu from './EditorContextMenu';
import EditorSnackbar from './EditorSnackbar';
import { useEditorContext } from './EditorContext';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  sidebar: {
    width: '320px',
    flexShrink: 0,
    overflowY: 'auto',
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
    padding: '1rem',
  },
  editorContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '1rem',
  },
  footer: {
    flexShrink: 0,
  }
};

function Editor() {
  const { fetchTemplates, fetchPosts } = useEditorContext();

  useEffect(() => {
    const refreshData = () => {
      fetchTemplates();
      fetchPosts();
    };

    // Initial fetch
    refreshData();

    // Event listener für Fokus
    window.addEventListener('focus', refreshData);

    return () => {
      window.removeEventListener('focus', refreshData);
    };
  }, [fetchTemplates, fetchPosts]);

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.content}>
        <aside style={styles.sidebar}>
          <EditorSidebar />
        </aside>
        <div style={styles.editorContainer}>
          <EditorMain />
        </div>
      </main>
      <div style={styles.footer}>
        <Footer />
      </div>
      <EditorContextMenu />
      <EditorSnackbar />
    </div>
  );
}

export default Editor; 
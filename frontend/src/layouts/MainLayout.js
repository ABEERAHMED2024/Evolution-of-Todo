import Head from 'next/head';
import { useState } from 'react';
import { FuturisticButton } from '../components/ui/futuristic-ui';

export default function Layout({ children, title = 'Evolution of Todo' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Futuristic AI-powered task management assistant" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <h1 className="title">Evolution<span className="accent">.</span>of<span className="accent">.</span>Todo</h1>
          
          <div className="header-actions">
            <FuturisticButton 
              variant="secondary" 
              size="sm"
              onClick={() => window.location.href = '/chat'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>AI Assistant</span>
            </FuturisticButton>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <nav className="navigation">
            <ul>
              <li>
                <a href="/" className="nav-link active">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9"></rect>
                    <rect x="14" y="3" width="7" height="5"></rect>
                    <rect x="14" y="12" width="7" height="9"></rect>
                    <rect x="3" y="16" width="7" height="5"></rect>
                  </svg>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="/chat" className="nav-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>AI Assistant</span>
                </a>
              </li>
              <li>
                <a href="#" className="nav-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>Analytics</span>
                </a>
              </li>
              <li>
                <a href="#" className="nav-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                  </svg>
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {children}
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <style jsx global>{`
        :root {
          --primary: #6366f1;
          --primary-dark: #4f46e5;
          --secondary: #8b5cf6;
          --accent: #ec4899;
          --background: #0f172a;
          --surface: #1e293b;
          --surface-light: #334155;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --text-muted: #94a3b8;
          --border: #334155;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --info: #3b82f6;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, var(--background) 0%, #1a243d 100%);
          color: var(--text-primary);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .layout {
          display: flex;
          min-height: 100vh;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
          padding: 1rem 2rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1400px;
          margin: 0 auto;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
        }

        .menu-toggle:hover {
          background: var(--surface-light);
        }

        .title {
          font-size: 1.8rem;
          font-weight: 700;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .accent {
          color: var(--accent);
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 280px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 2rem 1.5rem;
          z-index: 90;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .navigation ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .navigation li {
          margin-bottom: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: var(--text-secondary);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .nav-link:hover, .nav-link.active {
          background: var(--surface-light);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: rgba(99, 102, 241, 0.1);
          border-left: 3px solid var(--primary);
        }

        .nav-link svg {
          min-width: 20px;
        }

        .main {
          flex: 1;
          margin-left: 280px;
          padding: 100px 2rem 2rem;
          max-width: 1200px;
          margin-left: 280px;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 80;
        }

        @media (max-width: 1024px) {
          .menu-toggle {
            display: block;
          }
          
          .sidebar {
            width: 250px;
          }
          
          .main {
            margin-left: 0;
            padding-top: 80px;
          }
        }

        @media (max-width: 768px) {
          .main {
            padding: 90px 1rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
import React from 'react'
import { Cloud, Shield, Share2, Key, Terminal, Github as GitHub, ExternalLink } from 'lucide-react'

function App() {
  return (
    <>
      <div className="cyber-bg"></div>
      <div className="mesh-grid"></div>

      <nav>
        <div className="nav-container">
          <a href="#" className="logo">
            <Cloud color="#38bdf8" />
            CloudVault
          </a>
          <a 
            href="https://github.com/muhammadzili/cloudvault" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <Github size={18} />
            GitHub
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
             <div style={{ padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '999px', fontSize: '0.9rem', color: '#38bdf8', fontWeight: 500 }}>
                v1.0.0 is now open source
             </div>
          </div>
          <h1>
            Take Back Control of <br />
            <span className="gradient-text">Your Data.</span>
          </h1>
          <p>
            A premium, self-hosted file management system built for speed, privacy, and full control. Deploy your personal cloud infrastructure in seconds.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="#installation" className="btn btn-primary">
              <Terminal size={20} />
              Quick Start
            </a>
            <a href="https://github.com/muhammadzili/cloudvault" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <Github size={20} />
              Source Code
            </a>
          </div>
        </div>
      </section>

      <section id="features" style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Enterprise Features, <span className="gradient-text">Zero Cost.</span></h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need to manage files efficiently, without the recurring subscriptions.</p>
          </div>

          <div className="features-grid">
            <div className="glass-card">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Secure Core</h3>
              <p style={{ color: 'var(--text-muted)' }}>End-to-end JWT authentication, hardened API routes, and robust SQLite protection to prevent injection vectors.</p>
            </div>
            
            <div className="glass-card">
              <div className="feature-icon">
                <Share2 size={24} />
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Public Shared Pages</h3>
              <p style={{ color: 'var(--text-muted)' }}>Toggle any file to a beautifully designed, SEO-optimized public landing page for instant external sharing.</p>
            </div>

            <div className="glass-card">
              <div className="feature-icon">
                <Key size={24} />
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Programmable API Tokens</h3>
              <p style={{ color: 'var(--text-muted)' }}>Generate granular access tokens to integrate file uploads and downloads directly into your automation pipelines.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="installation">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="glass-card" style={{ padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Deploy in 60 Seconds</h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>
              CloudVault ships with both frontend and backend layers ready out of the box.
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <pre>
<code># 1. Clone the repository
git clone https://github.com/muhammadzili/cloudvault

# 2. Install global dependencies
cd cloudvault
npm install
cd client && npm install
cd ../server && npm install

# 3. Start the orchestrator
npm run dev</code>
              </pre>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <a href="https://github.com/muhammadzili/cloudvault" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                View Full Documentation <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '3rem 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4rem' }}>
        <div className="container">
          <Cloud color="#38bdf8" size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Built by <a href="https://github.com/muhammadzili" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>muhammadzili</a>. <br/> Open Source MIT License.
          </p>
        </div>
      </footer>
    </>
  )
}

export default App

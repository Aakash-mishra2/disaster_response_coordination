import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';

const API_URL = 'https://disaster-response-coordination-w01k.onrender.com';

function App() {
  // Disaster form state
  
  const [disasterForm, setDisasterForm] = useState({
    title: '',
    location_name: '',
    description: '',
    tags: '',
  });
  const [disasters, setDisasters] = useState<any[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<any | null>(null);
  const [reportForm, setReportForm] = useState({ content: '', image_url: '' });
  const [reports, setReports] = useState<any[]>([]);
  const [socialMedia, setSocialMedia] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [verification, setVerification] = useState<any | null>(null);
  const [status, setStatus] = useState('');
  const socketRef = useRef<Socket | null>(null);

  // Fetch disasters
  const fetchDisasters = async () => {
    const res = await fetch(`${API_URL}/disasters`);
    setDisasters(await res.json());
  };

  useEffect(() => {
  fetchDisasters();

  if (!socketRef.current) {
    socketRef.current = io(API_URL); // ✅ this replaces window.io
    socketRef.current.on('disaster_updated', fetchDisasters);

    socketRef.current.on('social_media_updated', (data: any) => {
      if (selectedDisaster && data.disaster_id === selectedDisaster.id) {
        setSocialMedia(data.posts);
      }
    });

    socketRef.current.on('resources_updated', (data: any) => {
      if (selectedDisaster && data.disaster_id === selectedDisaster.id) {
        setResources(data.resources);
      }
    });
  }

  return () => {
    socketRef.current?.disconnect();
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedDisaster]);


  // Handle disaster form submit
  const handleDisasterSubmit = async (e: any) => {
    e.preventDefault();
    setStatus('Creating disaster...');
    const res = await fetch(`${API_URL}/disasters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...disasterForm,
        tags: disasterForm.tags.split(',').map(t => t.trim()),
        owner_id: 'netrunnerX',
      }),
    });
    if (res.ok) {
      setStatus('Disaster created!');
      setDisasterForm({ title: '', location_name: '', description: '', tags: '' });
      fetchDisasters();
    } else {
      setStatus('Error creating disaster');
    }
  };

  // Handle report form submit
  const handleReportSubmit = async (e: any) => {
    e.preventDefault();
    setStatus('Submitting report...');
    // Mock: just add to local state
    setReports([...reports, { ...reportForm, verification_status: 'pending' }]);
    setReportForm({ content: '', image_url: '' });
    setStatus('Report submitted!');
  };

  // Select disaster and fetch related data
  const handleSelectDisaster = async (d: any) => {
    setSelectedDisaster(d);
    setStatus('Loading social media & resources...');
    const [sm, res] = await Promise.all([
      fetch(`${API_URL}/disasters/${d.id}/social-media`).then(r => r.json()),
      fetch(`${API_URL}/disasters/${d.id}/resources?lat=40.7128&lon=-74.0060`).then(r => r.json()),
    ]);
    setSocialMedia(sm);
    setResources(res);
    setStatus('');
  };

  // Image verification
  const handleVerifyImage = async (image_url: string) => {
    setStatus('Verifying image...');
    const res = await fetch(`${API_URL}/disasters/${selectedDisaster?.id}/verify-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url }),
    });
    setVerification(await res.json());
    setStatus('');
  };

  return (
    <div className="sexy-bg">
      <header className="sexy-header">
        <h1>🌐 Disaster Coordination Platform</h1>
        <p>Coordinate, report, and respond in real time.</p>
      </header>
      <main className="sexy-main">
        <section className="sexy-card">
          <h2>Create Disaster</h2>
          <form onSubmit={handleDisasterSubmit} className="sexy-form">
            <input required placeholder="Title" value={disasterForm.title} onChange={e => setDisasterForm(f => ({ ...f, title: e.target.value }))} />
            <input required placeholder="Location Name" value={disasterForm.location_name} onChange={e => setDisasterForm(f => ({ ...f, location_name: e.target.value }))} />
            <textarea required placeholder="Description" value={disasterForm.description} onChange={e => setDisasterForm(f => ({ ...f, description: e.target.value }))} />
            <input placeholder="Tags (comma separated)" value={disasterForm.tags} onChange={e => setDisasterForm(f => ({ ...f, tags: e.target.value }))} />
            <button type="submit">Create</button>
          </form>
        </section>
        <section className="sexy-card">
          <h2>Disasters</h2>
          <div className="sexy-list">
            {disasters.map(d => (
              <div key={d.id} className={`sexy-list-item${selectedDisaster?.id === d.id ? ' selected' : ''}`} onClick={() => handleSelectDisaster(d)}>
                <strong>{d.title}</strong> <span>({d.location_name})</span>
                <div className="tags">{d.tags?.join(', ')}</div>
                <div className="desc">{d.description}</div>
              </div>
            ))}
          </div>
        </section>
        {selectedDisaster && (
          <section className="sexy-card">
            <h2>Submit Report for {selectedDisaster.title}</h2>
            <form onSubmit={handleReportSubmit} className="sexy-form">
              <textarea required placeholder="Report content" value={reportForm.content} onChange={e => setReportForm(f => ({ ...f, content: e.target.value }))} />
              <input placeholder="Image URL" value={reportForm.image_url} onChange={e => setReportForm(f => ({ ...f, image_url: e.target.value }))} />
              <button type="submit">Submit Report</button>
            </form>
            <div className="sexy-list">
              {reports.map((r, i) => (
                <div key={i} className="sexy-list-item">
                  <div>{r.content}</div>
                  {r.image_url && <img src={r.image_url} alt="report" style={{ maxWidth: 120, borderRadius: 8, margin: '0.5em 0' }} />}
                  <div>Status: {r.verification_status}</div>
                  {r.image_url && <button onClick={() => handleVerifyImage(r.image_url)}>Verify Image</button>}
                </div>
              ))}
              {verification && <div className="sexy-list-item verified">Image Verification: {verification.status} ({verification.details})</div>}
            </div>
          </section>
        )}
        {selectedDisaster && (
          <section className="sexy-card">
            <h2>Social Media</h2>
            <div className="sexy-list">
              {socialMedia.map((s, i) => (
                <div key={i} className="sexy-list-item">
                  <span>🗨️ {s.post}</span> <span className="user">by {s.user}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        {selectedDisaster && (
          <section className="sexy-card">
            <h2>Nearby Resources</h2>
            <div className="sexy-list">
              {resources.map((r, i) => (
                <div key={i} className="sexy-list-item">
                  <strong>{r.name}</strong> <span>({r.type})</span>
                  <div>{r.location_name}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <footer className="sexy-footer">
        <span>{status}</span>
        <span style={{ float: 'right', opacity: 0.5 }}>Powered by Vite + React + Socket.IO</span>
      </footer>
    </div>
  );
}

export default App;

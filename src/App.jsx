import React, { useState, useEffect } from 'react';

// SVGs for Icons to avoid dependencies (defined globally to prevent React 19 node mismatch crashes)
const Icons = {
  Compass: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
  ),
  Queue: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
  ),
  Library: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
  ),
  Settings: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  ),
  Play: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
  ),
  Trash: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  ),
  Video: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
  ),
  Music: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
  ),
  Folder: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
  )
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [formatTypeFilter, setFormatTypeFilter] = useState('video'); // 'video' | 'audio'
  
  // Real-time downloads queue
  const [downloadQueue, setDownloadQueue] = useState([]);
  
  // Media library
  const [library, setLibrary] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  
  // System status and settings
  const [systemStatus, setSystemStatus] = useState(null);
  const [settingsPath, setSettingsPath] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  
  // Binary download state
  const [binaryProgress, setBinaryProgress] = useState({
    ytdlp: { status: 'idle', progress: 0, total: 0, error: null },
    ffmpeg: { status: 'idle', progress: 0, total: 0, error: null }
  });

  // Check system binaries and loads downloadsDir on startup
  useEffect(() => {
    fetchSystemStatus();
    fetchLibrary();
  }, []);

  // Set up SSE EventSource for real-time progress update
  useEffect(() => {
    const eventSource = new EventSource('/api/progress');

    eventSource.onmessage = (event) => {
      try {
        const queueData = JSON.parse(event.data);
        setDownloadQueue(queueData);
      } catch (e) {
        console.error('Failed to parse SSE queue data', e);
      }
    };

    eventSource.addEventListener('binaries', (event) => {
      try {
        const binData = JSON.parse(event.data);
        setBinaryProgress(binData);
      } catch (e) {
        console.error('Failed to parse SSE binaries data', e);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('SSE disconnected. Retrying...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/system-check');
      const data = await res.json();
      setSystemStatus(data);
      setSettingsPath(data.downloadsDir);
    } catch (e) {
      console.error('Failed to fetch system check', e);
    }
  };

  const fetchLibrary = async () => {
    try {
      const res = await fetch('/api/library');
      const data = await res.json();
      setLibrary(data);
    } catch (e) {
      console.error('Failed to fetch library', e);
    }
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!videoUrl.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      });
      const data = await res.json();

      if (res.ok) {
        setAnalysisResult(data);
        // Pre-select best quality format if available
        if (data.formats && data.formats.length > 0) {
          const firstVideo = data.formats.find(f => f.videoCodec !== 'none');
          setSelectedFormat(firstVideo ? firstVideo.formatId : data.formats[0].formatId);
        }
      } else {
        setAnalysisError(data.error || 'Failed to analyze URL.');
      }
    } catch (err) {
      setAnalysisError('Network error. Make sure the backend server is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartDownload = async () => {
    if (!analysisResult) return;

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: analysisResult.url,
          format: selectedFormat,
          metadata: {
            title: analysisResult.title,
            thumbnail: analysisResult.thumbnail
          }
        })
      });

      if (res.ok) {
        // Switch to download queue tab to view progress
        setActiveTab('queue');
        // Clear inputs
        setVideoUrl('');
        setAnalysisResult(null);
      } else {
        const errData = await res.json();
        alert(`Error starting download: ${errData.error}`);
      }
    } catch (err) {
      alert('Failed to connect to download server.');
    }
  };

  const handleSaveSettings = async () => {
    setSettingsMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadsDir: settingsPath })
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMessage('Settings saved successfully!');
        fetchSystemStatus(); // Refresh path state
      } else {
        setSettingsMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setSettingsMessage('Failed to save settings.');
    }
  };

  const handleSetupBinary = async (binaryType) => {
    try {
      await fetch('/api/setup-binaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: binaryType })
      });
      // Start polling system status to update UI indicator
      const interval = setInterval(async () => {
        const res = await fetch('/api/system-check');
        const data = await res.json();
        setSystemStatus(data);
        if (data[binaryType]) {
          clearInterval(interval);
        }
      }, 2000);
    } catch (err) {
      alert(`Failed to start installation for ${binaryType}`);
    }
  };

  const deleteLibraryFile = async (filename) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/library/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchLibrary();
      } else {
        alert('Failed to delete file.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearQueue = async () => {
    try {
      await fetch('/api/clear-completed', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVGs for Icons are defined globally outside the component to prevent unmounting crashes.

  return (
    <div className="app-container">
      {/* Elegant Glassmorphic App Header */}
      <header className="app-header">
        <div className="app-title-group">
          <span className="app-logo">NEPTUNE</span>
          <div>
            <h1 style={{ display: 'none' }}>Neptune Media Downloader</h1>
            <div className="app-subtitle">Media Downloader</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Icons.Compass /> 视频分析
          </button>
          <button 
            className={`nav-tab ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <Icons.Queue /> 下载队列
            {downloadQueue.some(item => item.status === 'downloading' || item.status === 'merging') && (
              <span className="status-dot active"></span>
            )}
          </button>
          <button 
            className={`nav-tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('library');
              fetchLibrary();
            }}
          >
            <Icons.Library /> 私人媒体库
          </button>
          <button 
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              fetchSystemStatus();
            }}
          >
            <Icons.Settings /> 系统设置
          </button>
        </nav>
      </header>

      {/* Primary Panels */}
      <main style={{ flexGrow: 1 }}>
        {/* Tab 1: Dashboard / Analyzer */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel search-container">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                输入音视频链接开始下载
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '-0.8rem', marginBottom: '0.5rem' }}>
                支持 YouTube, Bilibili, TikTok, Douyin, Twitter/X, Instagram 等数百个主流影音平台
              </p>
              <form onSubmit={handleAnalyze} className="search-box-wrapper">
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="https://www.youtube.com/watch?v=... 或 https://www.bilibili.com/video/..." 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={isAnalyzing}
                />
                <button type="submit" className="analyze-btn" disabled={isAnalyzing || !videoUrl.trim()}>
                  <Icons.Search /> {isAnalyzing ? '分析中...' : '解析链接'}
                </button>
              </form>

              {analysisError && (
                <div style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  <Icons.Alert /> {analysisError}
                </div>
              )}
            </div>

            {/* Analysis Result Displays */}
            {analysisResult && (
              <div className="glass-panel analysis-panel">
                {/* Left Side Preview */}
                <div className="video-preview-card">
                  <div className="thumbnail-wrapper">
                    <img 
                      src={analysisResult.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'} 
                      alt="Thumbnail" 
                      className="thumbnail-img"
                    />
                    <div className="video-duration">{formatDuration(analysisResult.duration)}</div>
                  </div>
                  <h3 className="video-title">{analysisResult.title}</h3>
                  <div className="video-uploader">发布者: {analysisResult.uploader}</div>
                </div>

                {/* Right Side Formats Config */}
                <div className="download-options-card">
                  <div className="format-tabs">
                    <button 
                      className={`format-tab-btn ${formatTypeFilter === 'video' ? 'active' : ''}`}
                      onClick={() => setFormatTypeFilter('video')}
                    >
                      视频画质
                    </button>
                    <button 
                      className={`format-tab-btn ${formatTypeFilter === 'audio' ? 'active' : ''}`}
                      onClick={() => setFormatTypeFilter('audio')}
                    >
                      音频提取
                    </button>
                  </div>

                  <div className="format-list">
                    {formatTypeFilter === 'video' ? (
                      // Show Video Formats
                      analysisResult.formats && analysisResult.formats.filter(f => f.videoCodec !== 'none').length > 0 ? (
                        analysisResult.formats
                          .filter(f => f.videoCodec !== 'none')
                          .map((f, i) => (
                            <div 
                              key={f.formatId + i}
                              className={`format-item ${selectedFormat === f.formatId ? 'selected' : ''}`}
                              onClick={() => setSelectedFormat(f.formatId)}
                            >
                              <div className="radio-circle"></div>
                              <div className="format-res">{f.resolution} {f.fps ? `@${f.fps}fps` : ''}</div>
                              <div className="format-codec">{f.videoCodec.split('.')[0]} / {f.audioCodec !== 'none' ? '有声' : '无声'}</div>
                              <div className="format-size">{f.filesize ? formatBytes(f.filesize) : '估算中'}</div>
                              <div className="format-ext">{f.extension}</div>
                            </div>
                          ))
                      ) : (
                        <div className="empty-state">没有可用的视频格式</div>
                      )
                    ) : (
                      // Show Audio Formats
                      analysisResult.formats && analysisResult.formats.filter(f => f.videoCodec === 'none').length > 0 ? (
                        analysisResult.formats
                          .filter(f => f.videoCodec === 'none')
                          .map((f, i) => (
                            <div 
                              key={f.formatId + i}
                              className={`format-item ${selectedFormat === f.formatId ? 'selected' : ''}`}
                              onClick={() => setSelectedFormat(f.formatId)}
                            >
                              <div className="radio-circle"></div>
                              <div className="format-res">音频提取 ({f.qualityNote || 'HQ'})</div>
                              <div className="format-codec">{f.audioCodec.split('.')[0]}</div>
                              <div className="format-size">{f.filesize ? formatBytes(f.filesize) : '估算中'}</div>
                              <div className="format-ext">{f.extension}</div>
                            </div>
                          ))
                      ) : (
                        <div className="empty-state">没有可用的音频格式</div>
                      )
                    )}
                  </div>

                  {!systemStatus?.ffmpeg && formatTypeFilter === 'video' && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--warning-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Icons.Alert /> 检测到未安装 FFmpeg。已自动限制只能下载 720p 以下的合成画质以防止出错。请在“系统设置”中一键安装 FFmpeg 开启 1080p/4K 下载。
                    </div>
                  )}

                  <button className="start-dl-btn" onClick={handleStartDownload}>
                    <Icons.Play /> 立即加入下载队列
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Downloads Queue */}
        {activeTab === 'queue' && (
          <div className="queue-container">
            <div className="section-header">
              <h2 className="section-title">下载任务队列</h2>
              {downloadQueue.length > 0 && (
                <button className="clear-btn" onClick={clearQueue}>
                  清除已完成任务
                </button>
              )}
            </div>

            {downloadQueue.length === 0 ? (
              <div className="glass-panel empty-state">
                <div className="empty-icon">📂</div>
                <p>当前下载队列为空</p>
                <p style={{ fontSize: '0.85rem' }}>在 “视频分析” 面板中解析并添加任务，即可在这里看到下载进度</p>
              </div>
            ) : (
              <div className="queue-list">
                {downloadQueue.map((item) => (
                  <div key={item.id} className="glass-panel queue-item">
                    <div className="queue-thumbnail">
                      <img 
                        src={item.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'} 
                        alt="" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="queue-details">
                      <div className="queue-meta">
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <div className="queue-title">{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            发布者: {item.uploader}
                          </div>
                        </div>
                        <span className={`status-badge ${item.status}`}>
                          {item.status === 'downloading' && '下载中'}
                          {item.status === 'merging' && '合并混流中'}
                          {item.status === 'completed' && '已完成'}
                          {item.status === 'failed' && '下载失败'}
                        </span>
                      </div>

                      {item.status !== 'failed' ? (
                        <>
                          <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${item.progress}%` }}></div>
                          </div>

                          <div className="queue-stats">
                            <div className="queue-stat-item">进度: <span>{item.progress}%</span></div>
                            {item.status === 'downloading' && (
                              <>
                                <div className="queue-stat-item">速度: <span>{item.speed}</span></div>
                                <div className="queue-stat-item">剩余时间: <span>{item.eta}</span></div>
                                <div className="queue-stat-item">文件大小: <span>{item.size}</span></div>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="queue-error">
                          <strong>错误：</strong>{item.error || '未知下载错误'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Personal Media Library */}
        {activeTab === 'library' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="section-header">
              <h2 className="section-title">本地私人影音馆</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Icons.Folder /> 存储路径: {systemStatus?.downloadsDir || '加载中...'}
              </span>
            </div>

            {library.length === 0 ? (
              <div className="glass-panel empty-state">
                <div className="empty-icon">🎥</div>
                <p>影音馆空空如也</p>
                <p style={{ fontSize: '0.85rem' }}>下载成功的视频文件将自动整理并呈现在这里，支持一键点播</p>
              </div>
            ) : (
              <div className="library-grid">
                {library.map((file, idx) => (
                  <div key={file.name} className="glass-panel media-card">
                    <div className="media-preview-box">
                      <div className="media-icon">
                        {file.type === 'video' ? <Icons.Video /> : <Icons.Music />}
                      </div>
                      <div className="media-hover-overlay">
                        <button className="play-action-btn" onClick={() => setActiveVideo(file.name)}>
                          <Icons.Play />
                        </button>
                        <button className="delete-action-btn" onClick={() => deleteLibraryFile(file.name)}>
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                    <div className="media-info">
                      <div className="media-name" title={file.name}>
                        {file.name}
                      </div>
                      <div className="media-meta-row">
                        <span>大小: {formatBytes(file.size)}</span>
                        <span>格式: {file.ext}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: System Settings */}
        {activeTab === 'settings' && (
          <div className="settings-container">
            {/* Download Directory Config */}
            <div className="glass-panel setting-card">
              <h3 className="setting-title">存储设置</h3>
              <div className="form-group">
                <label className="form-label">视频下载保存路径</label>
                <div className="form-input-group">
                  <input 
                    type="text" 
                    className="form-input-text" 
                    value={settingsPath}
                    onChange={(e) => setSettingsPath(e.target.value)}
                  />
                  <button className="save-setting-btn" onClick={handleSaveSettings}>
                    保存设置
                  </button>
                </div>
                {settingsMessage && (
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: settingsMessage.includes('successfully') ? 'var(--success-color)' : 'var(--danger-color)',
                    marginTop: '0.25rem' 
                  }}>
                    {settingsMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Binary Checker & One-click installer */}
            <div className="glass-panel setting-card">
              <h3 className="setting-title">核心引擎依赖检测</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.8rem' }}>
                Neptune 运行需要底层 CLI 引擎，若显示缺失，请点击一键自动配置部署（仅限 Windows）。
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* yt-dlp check */}
                <div className="binary-row">
                  <span className="binary-name">yt-dlp</span>
                  <span className={`binary-status-pill ${systemStatus?.ytdlp ? 'installed' : 'missing'}`}>
                    {systemStatus?.ytdlp ? '已就绪' : '未就绪'}
                  </span>
                  
                  <div className="binary-action-container">
                    {binaryProgress.ytdlp.status === 'downloading' ? (
                      <div className="bin-progress-wrapper">
                        <div className="bin-progress-text">
                          <span>下载中...</span>
                          <span>
                            {binaryProgress.ytdlp.total 
                              ? `${((binaryProgress.ytdlp.progress / binaryProgress.ytdlp.total) * 100).toFixed(0)}%` 
                              : '0%'}
                          </span>
                        </div>
                        <div className="bin-progress-bar">
                          <div 
                            className="bin-progress-fill" 
                            style={{ 
                              width: `${binaryProgress.ytdlp.total ? (binaryProgress.ytdlp.progress / binaryProgress.ytdlp.total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      !systemStatus?.ytdlp && (
                        <button className="download-bin-btn" onClick={() => handleSetupBinary('ytdlp')}>
                          一键安装
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* ffmpeg check */}
                <div className="binary-row">
                  <span className="binary-name">FFmpeg</span>
                  <span className={`binary-status-pill ${systemStatus?.ffmpeg ? 'installed' : 'missing'}`}>
                    {systemStatus?.ffmpeg ? '已就绪' : '未就绪'}
                  </span>

                  <div className="binary-action-container">
                    {binaryProgress.ffmpeg.status === 'downloading' ? (
                      <div className="bin-progress-wrapper">
                        <div className="bin-progress-text">
                          <span>下载中并解压(约90MB)...</span>
                          <span>
                            {binaryProgress.ffmpeg.total 
                              ? `${((binaryProgress.ffmpeg.progress / binaryProgress.ffmpeg.total) * 100).toFixed(0)}%` 
                              : '0%'}
                          </span>
                        </div>
                        <div className="bin-progress-bar">
                          <div 
                            className="bin-progress-fill" 
                            style={{ 
                              width: `${binaryProgress.ffmpeg.total ? (binaryProgress.ffmpeg.progress / binaryProgress.ffmpeg.total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      !systemStatus?.ffmpeg && (
                        <button className="download-bin-btn" onClick={() => handleSetupBinary('ffmpeg')}>
                          一键配置
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Modern Custom Media Player Overlay */}
      {activeVideo && (
        <div className="player-overlay" onClick={() => setActiveVideo(null)}>
          <div className="player-container" onClick={(e) => e.stopPropagation()}>
            <div className="player-header">
              <span className="player-title">{activeVideo}</span>
              <button className="close-player-btn" onClick={() => setActiveVideo(null)}>
                ✕
              </button>
            </div>
            <video 
              className="custom-video" 
              controls 
              autoPlay
              src={`/api/stream/${encodeURIComponent(activeVideo)}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

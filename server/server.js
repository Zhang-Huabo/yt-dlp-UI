import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  checkBinaries, 
  downloadYtdlp, 
  downloadFfmpeg 
} from './binManager.js';
import { 
  analyzeUrl, 
  startDownload, 
  registerSSEClient, 
  unregisterSSEClient, 
  broadcastState,
  getDownloadsDir,
  setDownloadsDir,
  clearCompletedDownloads
} from './downloader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Global binary download progress state
let binaryStatus = {
  ytdlp: { status: 'idle', progress: 0, total: 0, error: null },
  ffmpeg: { status: 'idle', progress: 0, total: 0, error: null }
};

// Expose SSE client connection
app.get('/api/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  registerSSEClient(res);

  // Send binary status immediately
  res.write(`event: binaries\ndata: ${JSON.stringify(binaryStatus)}\n\n`);

  req.on('close', () => {
    unregisterSSEClient(res);
  });
});

// Broadcast binary status helper
function broadcastBinaryStatus() {
  const data = JSON.stringify(binaryStatus);
  // Send as a custom event to SSE
  // We can write to active SSE clients registered in downloader.js
  // Let's create an export in downloader.js or broadcast directly if possible
  // We can implement it via custom message in SSE stream.
  // We'll write to clients list
}

// System check endpoint
app.get('/api/system-check', (req, res) => {
  const bins = checkBinaries();
  res.json({
    ...bins,
    downloadsDir: getDownloadsDir()
  });
});

// Setup binaries trigger
app.post('/api/setup-binaries', async (req, res) => {
  const { type } = req.body || {}; // 'ytdlp' | 'ffmpeg'

  if (type !== 'ytdlp' && type !== 'ffmpeg') {
    return res.status(400).json({ error: 'Invalid binary type. Must be ytdlp or ffmpeg.' });
  }

  if (binaryStatus[type].status === 'downloading') {
    return res.json({ message: 'Download already in progress.' });
  }

  binaryStatus[type] = { status: 'downloading', progress: 0, total: 0, error: null };
  res.json({ message: `Started downloading ${type}` });

  try {
    const onProgress = (downloaded, total) => {
      binaryStatus[type].progress = downloaded;
      binaryStatus[type].total = total;
      // Trigger a state broadcast by sending custom SSE messages
      // For now, we can just trigger a general broadcast from server.js
    };

    if (type === 'ytdlp') {
      await downloadYtdlp(onProgress);
    } else {
      await downloadFfmpeg(onProgress);
    }

    binaryStatus[type].status = 'completed';
    binaryStatus[type].progress = binaryStatus[type].total;
  } catch (err) {
    binaryStatus[type].status = 'failed';
    binaryStatus[type].error = err.message;
  }
});

// Analyze video url
app.post('/api/analyze', async (req, res) => {
  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const info = await analyzeUrl(url);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download video
app.post('/api/download', (req, res) => {
  const { url, format, metadata } = req.body || {};
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const downloadId = startDownload(url, format, metadata || {});
    res.json({ success: true, downloadId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Configure downloads folder
app.post('/api/settings', (req, res) => {
  const { downloadsDir: newDir } = req.body || {};
  if (!newDir) {
    return res.status(400).json({ error: 'downloadsDir is required' });
  }

  const success = setDownloadsDir(newDir);
  if (success) {
    res.json({ success: true, downloadsDir: getDownloadsDir() });
  } else {
    res.status(500).json({ error: 'Failed to create or access the directory' });
  }
});

// Clear completed downloads
app.post('/api/clear-completed', (req, res) => {
  clearCompletedDownloads();
  res.json({ success: true });
});

// Media Library list
app.get('/api/library', async (req, res) => {
  const ddir = getDownloadsDir();
  
  if (!fs.existsSync(ddir)) {
    return res.json([]);
  }

  try {
    const files = await fs.promises.readdir(ddir);
    const mediaFiles = [];

    for (const file of files) {
      const filePath = path.join(ddir, file);
      const stat = await fs.promises.stat(filePath);
      
      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        // Support common video and audio extensions
        const isVideo = ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.flv'].includes(ext);
        const isAudio = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac'].includes(ext);

        if (isVideo || isAudio) {
          mediaFiles.push({
            name: file,
            size: stat.size,
            birthtime: stat.birthtime,
            type: isVideo ? 'video' : 'audio',
            ext: ext.slice(1)
          });
        }
      }
    }

    // Sort by newest first
    mediaFiles.sort((a, b) => b.birthtime - a.birthtime);
    res.json(mediaFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete media file
app.delete('/api/library/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(getDownloadsDir(), filename);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stream media file
app.get('/api/stream/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(getDownloadsDir(), filename);

  if (fs.existsSync(filePath)) {
    // Express sendFile handles partial content range requests automatically
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Serve frontend build static files in production
const buildPath = path.join(rootDir, 'dist');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    } else {
      next();
    }
  });
}

app.listen(PORT, () => {
  console.log(`Neptune Backend running on http://localhost:${PORT}`);
});

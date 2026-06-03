import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { checkBinaries } from './binManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Default downloads folder
let downloadsDir = path.join(rootDir, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Map to store active downloads: id -> downloadState
const activeDownloads = new Map();
// SSE clients connected
const clients = [];

export function getDownloadsDir() {
  return downloadsDir;
}

export function setDownloadsDir(newDir) {
  if (fs.existsSync(newDir)) {
    downloadsDir = newDir;
    return true;
  }
  try {
    fs.mkdirSync(newDir, { recursive: true });
    downloadsDir = newDir;
    return true;
  } catch (e) {
    return false;
  }
}

export function registerSSEClient(res) {
  clients.push(res);
  // Send initial state
  res.write(`data: ${JSON.stringify(Array.from(activeDownloads.values()))}\n\n`);
}

export function unregisterSSEClient(res) {
  const index = clients.indexOf(res);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

export function broadcastState() {
  const data = JSON.stringify(Array.from(activeDownloads.values()));
  clients.forEach(client => {
    client.write(`data: ${data}\n\n`);
  });
}

// Clear finished downloads from active list
export function clearCompletedDownloads() {
  for (const [id, item] of activeDownloads.entries()) {
    if (item.status === 'completed' || item.status === 'failed') {
      activeDownloads.delete(id);
    }
  }
  broadcastState();
}

// Analyze video URL details
export function analyzeUrl(url) {
  return new Promise((resolve, reject) => {
    const bins = checkBinaries();
    if (!bins.ytdlp) {
      reject(new Error('yt-dlp binary is not installed/configured.'));
      return;
    }

    const command = bins.paths.ytdlp || 'yt-dlp';
    
    // Launch yt-dlp to get JSON dump
    const args = [
      '--cookies', path.resolve(rootDir, 'cookies.txt'),
      '--js-runtimes', 'node:' + process.execPath,
      '--dump-json', '--flat-playlist', 
      url
    ];
    
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
        return;
      }

      try {
        const metadata = JSON.parse(stdout);
        
        // Extract useful formats
        const formats = [];
        if (metadata.formats) {
          metadata.formats.forEach(f => {
            // Filter out files that don't have video/audio or are just storyboards
            if (f.acodec === 'none' && f.vcodec === 'none') return;
            
            formats.push({
              formatId: f.format_id,
              extension: f.ext,
              resolution: f.resolution || (f.height ? `${f.width}x${f.height}` : 'audio'),
              fps: f.fps || null,
              filesize: f.filesize || f.filesize_approx || null,
              videoCodec: f.vcodec,
              audioCodec: f.acodec,
              qualityNote: f.format_note || '',
              type: (f.vcodec !== 'none' && f.acodec !== 'none') ? 'combined' : (f.vcodec !== 'none' ? 'video-only' : 'audio-only')
            });
          });
        }

        resolve({
          id: metadata.id,
          title: metadata.title,
          uploader: metadata.uploader || metadata.channel || 'Unknown',
          duration: metadata.duration || 0,
          thumbnail: metadata.thumbnail || (metadata.thumbnails && metadata.thumbnails.length > 0 ? metadata.thumbnails[metadata.thumbnails.length - 1].url : ''),
          url: url,
          formats: formats.reverse() // Sort to put higher quality first
        });
      } catch (e) {
        reject(new Error(`Failed to parse metadata: ${e.message}`));
      }
    });
  });
}

// Start download subprocess
export function startDownload(url, formatSelection, videoMetadata) {
  const bins = checkBinaries();
  if (!bins.ytdlp) {
    throw new Error('yt-dlp is missing.');
  }

  const id = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const command = bins.paths.ytdlp || 'yt-dlp';
  
  // Format argument
  // If user selected a specific format, use it.
  // Otherwise, default:
  // - If ffmpeg is available: bv*+ba/b (best video + best audio merged)
  // - If ffmpeg is NOT available: b (best combined single file, to avoid merge errors)
  let formatArg = 'bv*+ba/b';
  if (formatSelection) {
    formatArg = formatSelection;
  } else if (!bins.ffmpeg) {
    formatArg = 'b'; // Fallback to avoid merge crash
  }

  const downloadState = {
    id,
    url,
    title: videoMetadata.title || 'Fetching title...',
    uploader: videoMetadata.uploader || 'Unknown',
    thumbnail: videoMetadata.thumbnail || '',
    progress: 0,
    speed: '0 KiB/s',
    eta: '00:00',
    size: 'Unknown',
    status: 'downloading',
    error: null,
  };

  activeDownloads.set(id, downloadState);
  broadcastState();

  const args = [
    '--cookies', path.resolve(rootDir, 'cookies.txt'),
    '--js-runtimes', 'node:' + process.execPath,
    '-f', formatArg,
    '--newline',
    '--progress',
    '-o', path.join(downloadsDir, '%(title)s.%(ext)s'),
  ];

  // If ffmpeg is local, specify its path to yt-dlp
  if (bins.local.ffmpeg) {
    const binFolderPath = path.resolve(rootDir, 'bin');
    args.push('--ffmpeg-location', binFolderPath);
  }

  args.push(url);

  const child = spawn(command, args);
  let stderr = '';

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      // Parse progress: [download]  10.2% of ~50.20MiB at  2.45MiB/s ETA 00:20
      const progressRegex = /\[download\]\s+([0-9.]+)%\s+of\s+(?:~)?([0-9.a-zA-Z]+)\s+at\s+([0-9.a-zA-Z/]+)\s+ETA\s+([0-9:]+)/;
      const match = line.match(progressRegex);

      if (match) {
        downloadState.progress = parseFloat(match[1]);
        downloadState.size = match[2];
        downloadState.speed = match[3];
        downloadState.eta = match[4];
        downloadState.status = 'downloading';
        broadcastState();
      }

      // Check if it entered merging state
      if (line.includes('[Merger]') || line.includes('Merging formats')) {
        downloadState.status = 'merging';
        downloadState.progress = 99; // Arbitrary high progress for merging
        broadcastState();
      }
    });
  });

  child.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  child.on('close', (code) => {
    if (code === 0) {
      downloadState.status = 'completed';
      downloadState.progress = 100;
      downloadState.speed = '0 B/s';
      downloadState.eta = '00:00';
    } else {
      downloadState.status = 'failed';
      downloadState.error = stderr.trim() || `yt-dlp process exited with code ${code}`;
      console.error(`Download failed: ${downloadState.error}`);
    }
    broadcastState();
  });

  return id;
}

import https from 'https';
import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const binDir = path.join(rootDir, 'bin');
const ytdlpPath = path.join(binDir, 'yt-dlp.exe');
const ffmpegPath = path.join(binDir, 'ffmpeg.exe');
const ffprobePath = path.join(binDir, 'ffprobe.exe');

// Ensure bin directory exists
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Download helper with redirect support
function downloadFile(url, destPath, progressCallback) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    const request = (targetUrl) => {
      https.get(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      }, (response) => {
        if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
          request(response.headers.location);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${targetUrl}' (${response.statusCode})`));
          return;
        }
        
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        
        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (progressCallback && totalSize) {
            progressCallback(downloadedSize, totalSize);
          }
        });
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };
    
    request(url);
  });
}

// Check system path or local bin
export function checkBinaries() {
  let hasYtdlp = false;
  let hasFfmpeg = false;
  let localYtdlp = fs.existsSync(ytdlpPath);
  let localFfmpeg = fs.existsSync(ffmpegPath);

  let pathYtdlp = '';
  let pathFfmpeg = '';

  // 1. Check local bin folder
  if (localYtdlp) {
    hasYtdlp = true;
    pathYtdlp = ytdlpPath;
  }
  if (localFfmpeg) {
    hasFfmpeg = true;
    pathFfmpeg = ffmpegPath;
  }

  // 2. Check system PATH if local is missing
  if (!hasYtdlp) {
    try {
      execSync('where yt-dlp', { stdio: 'ignore' });
      hasYtdlp = true;
      pathYtdlp = 'yt-dlp'; // Use command from path
    } catch (e) {
      // Not in path
    }
  }

  if (!hasFfmpeg) {
    try {
      execSync('where ffmpeg', { stdio: 'ignore' });
      hasFfmpeg = true;
      pathFfmpeg = 'ffmpeg';
    } catch (e) {
      // Not in path
    }
  }

  return {
    ytdlp: hasYtdlp,
    ffmpeg: hasFfmpeg,
    local: {
      ytdlp: localYtdlp,
      ffmpeg: localFfmpeg
    },
    paths: {
      ytdlp: pathYtdlp,
      ffmpeg: pathFfmpeg
    }
  };
}

// Download yt-dlp.exe
export async function downloadYtdlp(onProgress) {
  const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe';
  const tempPath = ytdlpPath + '.tmp';
  
  try {
    await downloadFile(url, tempPath, onProgress);
    if (fs.existsSync(ytdlpPath)) {
      fs.unlinkSync(ytdlpPath);
    }
    fs.renameSync(tempPath, ytdlpPath);
    return true;
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    throw err;
  }
}

// Download and extract ffmpeg (Windows release)
export async function downloadFfmpeg(onProgress) {
  // A small and fast zip build of ffmpeg from a reliable repo, or essentials build
  // We use a GitHub mirror or Gyan.dev URL. Gyan.dev is official.
  // We'll use a direct download of a smaller, compiled release if possible, or standard gyan release.
  // Standard release essentials: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
  // Or a precompiled light binary from GitHub to make it download in 5 seconds instead of 5 minutes:
  // e.g. https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl-shared.zip is huge.
  // Let's use gyan's release essentials zip which is ~95MB.
  const url = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip';
  const zipPath = path.join(binDir, 'ffmpeg.zip');
  const tempExtractDir = path.join(binDir, 'ffmpeg_temp');

  try {
    // 1. Download ZIP
    await downloadFile(url, zipPath, onProgress);

    // 2. Extract ZIP using PowerShell (Windows native)
    if (fs.existsSync(tempExtractDir)) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempExtractDir, { recursive: true });

    return new Promise((resolve, reject) => {
      // Run PowerShell Expand-Archive command
      const cmd = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempExtractDir}' -Force"`;
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to extract ffmpeg zip: ${error.message}`));
          return;
        }

        try {
          // Find ffmpeg.exe and ffprobe.exe in the extracted directories
          const findBinaries = (dir) => {
            const files = fs.readdirSync(dir);
            let ffmpegFound = '';
            let ffprobeFound = '';

            for (const file of files) {
              const fullPath = path.join(dir, file);
              const stat = fs.statSync(fullPath);

              if (stat.isDirectory()) {
                const subResults = findBinaries(fullPath);
                if (subResults.ffmpeg) ffmpegFound = subResults.ffmpeg;
                if (subResults.ffprobe) ffprobeFound = subResults.ffprobe;
              } else if (file === 'ffmpeg.exe') {
                ffmpegFound = fullPath;
              } else if (file === 'ffprobe.exe') {
                ffprobeFound = fullPath;
              }
            }

            return { ffmpeg: ffmpegFound, ffprobe: ffprobeFound };
          };

          const binaries = findBinaries(tempExtractDir);

          if (!binaries.ffmpeg || !binaries.ffprobe) {
            reject(new Error('ffmpeg.exe or ffprobe.exe not found in zip archive'));
            return;
          }

          // Copy binaries to local bin/
          if (fs.existsSync(ffmpegPath)) fs.unlinkSync(ffmpegPath);
          if (fs.existsSync(ffprobePath)) fs.unlinkSync(ffprobePath);

          fs.copyFileSync(binaries.ffmpeg, ffmpegPath);
          fs.copyFileSync(binaries.ffprobe, ffprobePath);

          // Clean up temp files
          fs.rmSync(tempExtractDir, { recursive: true, force: true });
          fs.unlinkSync(zipPath);

          resolve(true);
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (err) {
    // Clean up
    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    if (fs.existsSync(tempExtractDir)) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }
    throw err;
  }
}

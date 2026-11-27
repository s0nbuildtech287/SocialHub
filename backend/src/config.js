import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const settingsFile = path.join(dataDir, 'settings.json');

const defaultSettings = {
  fbPageId: process.env.FB_PAGE_ID || '1492917437245491',
  fbPageToken: process.env.FB_PAGE_TOKEN || '',
  geminiApiKey: process.env.GEMINI_API_KEY || ''
};

export function getSettings() {
  try {
    if (fs.existsSync(settingsFile)) {
      const data = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      return { ...defaultSettings, ...data };
    }
  } catch (err) {
    console.error('Error reading settings.json:', err.message);
  }
  return defaultSettings;
}

export function saveSettings(newSettings) {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  fs.writeFileSync(settingsFile, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

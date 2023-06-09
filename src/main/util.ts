/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

const userDataPath = app.getPath('userData');

const configPath = path.join(userDataPath, 'setting.json');
const defaultConfig = {
  apiKey: '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',
};

export function getUserConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (err) {
    console.log('parse config err', err);
  }
  writeUserConfig(defaultConfig);
  return defaultConfig;
}

export function writeUserConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data), 'utf8');
}

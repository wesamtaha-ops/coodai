import fs from 'fs';
import path from 'path';

const defaultSettings = {
    systemPrompt: `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.`,
    chatTemperature: 0,
    allowChatHistory: 0,
    chatModel: 0,
    mainBG: '#f9f9f9',
    mainFont: 'Arial',
    chatIcon: 'https://cdn.jawwy.tv/9/avatar-smile.svg',
    userIcon: 'https://cdn.jawwy.tv/9/avatar-smile.svg',
    userMessageBG: '#2c3033',
    userMessageColor: '#ffffff',
    systemMessageBG: '#2c3033',
    systemMessageColor: '#ffffff',
    promptBG: '#f8f8f8',
    promptColor: '#f9f9f9',
    submitBG: '#1679c4',
    userIconColor: '#8489de',
    // Add other default settings here
};


export default function handler(req, res) {
  if (req.method === 'GET') {
    const { clientFolder } = req.query;
    const dataPath = process.env.dataPath;
    const clientFolderPath = path.resolve(dataPath, clientFolder, 'original');
    const settingsFilePath = path.join(clientFolderPath, 'settings.json');

    fs.readFile(settingsFilePath, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // Create the settings file if it doesn't exist
          writeDefaultSettings(settingsFilePath, res);
        } else {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Failed to read settings file.' });
        }
      } else {
        try {
          const settings = JSON.parse(data);
          const updatedSettings = { ...defaultSettings, ...settings };
          res.status(200).json(updatedSettings);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          writeDefaultSettings(settingsFilePath, res);
        }
      }
    });
  } else if (req.method === 'POST') {
    const { clientFolder } = req.query;
    const dataPath = process.env.dataPath;
    const clientFolderPath = path.resolve(dataPath, clientFolder, 'original');

    const formData = req.body;

    const settingsFilePath = path.join(clientFolderPath, 'settings.json');

    fs.readFile(settingsFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
        res.status(500).json({ error: 'Failed to read settings file.' });
        return;
      }
      try {
        const settings = JSON.parse(data);
        const updatedSettings = { ...settings, ...formData };
        const updatedSettingsJSON = JSON.stringify(updatedSettings, null, 2);
        fs.writeFile(settingsFilePath, updatedSettingsJSON, 'utf8', (err) => {
          if (err) {
            console.error('Error writing JSON file:', err);
            res.status(500).json({ error: 'Failed to update settings.' });
            return;
          }
          res.status(200).json({ message: 'Settings updated successfully.' });
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).json({ error: 'Failed to parse JSON.' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}

function writeDefaultSettings(filePath, res) {
  fs.writeFile(filePath, JSON.stringify(defaultSettings, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing JSON file:', err);
      res.status(500).json({ error: 'Failed to update settings.' });
      return;
    }
    res.status(200).json(defaultSettings);
  });
}

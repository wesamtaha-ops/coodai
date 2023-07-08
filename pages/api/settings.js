import fs from 'fs';
import path from 'path';

const defaultSettings = {
  systemPrompt: `I want you to act as a document that I am having a conversation with. Your name is "AI Assistant". You will provide me with answers from the given info. If the answer is not included, say exactly "Hmm, I am not sure." and stop after that. Refuse to answer any question not about the info. Never break character.`,
  chatTemperature: 0,
  allowChatHistory: 0,
  chatModel: 'gpt-3.5-turbo',
  mainBG: '#ffffff',
  mainFont: 'Almarai',
  chatIcon: 'https://cood.ai/bot/avatar-smile.svg',
  userIcon: 'https://cood.ai/bot/avatar-smile.svg',
  userMessageBG: '#3b81f6',
  userMessageColor: '#ffffff',
  systemMessageBG: '#f1f1f0',
  systemMessageColor: '#000000',
  promptBG: '#f8f8f8',
  promptColor: '#000000',
  submitBG: '#1679c4',
  userIconColor: '#8489de',
  // Add other default settings here
};


export default function handler(req, res) {
  if (req.method === 'GET') {
    const { clientFolder } = req.query;
    const { botName } = req.query;
    const dataPath = process.env.dataPath;
    const clientFolderPath = path.resolve(dataPath, clientFolder, botName, 'original');
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
    const { botName } = req.query;
    const dataPath = process.env.dataPath;
    const clientFolderPath = path.resolve(dataPath, clientFolder, botName, 'original');

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

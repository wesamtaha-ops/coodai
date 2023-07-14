import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { client } = req.query;

  if (req.method === 'GET') {
    // Retrieve the list of directories for the client
    const dataPath = process.env.dataPath;
    const clientFolderPath = path.resolve(dataPath, client);

    try {
      const directories = fs.readdirSync(clientFolderPath).filter((dir) =>
        fs.lstatSync(path.join(clientFolderPath, dir)).isDirectory()
      );

      if (directories.length === 0) {
        res.status(200).json({
          directories: [],
          empty: true,
        });
      } else {
        res.status(200).json({
          directories,
          empty: false,
        });
      }
    } catch (error) {
      res.status(200).json({
        empty: true,
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete a directory for the client
    const { directoryName } = req.query;
    if (!directoryName) {
      res.status(400).json({ error: 'Missing directory name' });
      return;
    }
    const dataPath = process.env.dataPath;
    const clientFolderPath = path.resolve(dataPath, client);
    const directoryPath = path.join(clientFolderPath, directoryName);

    try {
      fs.rmdirSync(directoryPath, { recursive: true });
      res.status(200).json({ message: 'Directory deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete directory' });
    }
  } else if (req.method === 'POST') {
    const { directoryName, newDirectoryName } = req.query;

    if (directoryName && newDirectoryName) {
      // Rename an existing directory
      const dataPath = process.env.dataPath;
      const clientFolderPath = path.resolve(dataPath, client);
      const directoryPath = path.join(clientFolderPath, directoryName);
      const newDirectoryPath = path.join(clientFolderPath, newDirectoryName);

      try {
        console.log('Renaming directory:', directoryPath, newDirectoryPath);
        fs.renameSync(directoryPath, newDirectoryPath);
        res.status(200).json({ message: 'Directory renamed successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to rename directory' });
      }
    } else if (directoryName) {
      // Create a new directory
      const dataPath = process.env.dataPath;
      const clientFolderPath = path.resolve(dataPath, client);
      const newDirectoryPath = path.join(clientFolderPath, directoryName);

      try {
        fs.mkdirSync(newDirectoryPath);

        const dataFolderPath = path.join(newDirectoryPath, 'data');
        fs.mkdirSync(dataFolderPath);

        // Create the "original" folder and files
        const originalFolderPath = path.join(newDirectoryPath, 'original');
        fs.mkdirSync(originalFolderPath);

        const qaFilePath = path.join(originalFolderPath, 'qa.txt');
        const urlsFilePath = path.join(originalFolderPath, 'urls.txt');
        const settingsFilePath = path.join(originalFolderPath, 'settings.json');

        fs.writeFileSync(qaFilePath, '');
        fs.writeFileSync(urlsFilePath, '');

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

        fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2));

        res.status(200).json({ message: 'Directory created successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create directory' });
      }
    } else {
      res.status(400).json({ error: 'Missing directory name' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

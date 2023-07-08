import fs from 'fs';
import path from 'path';

const excludedFiles = ['urls.txt', 'qa.txt', 'settings.json'];

export default function handler(req, res) {
  const { bot } = req.query;
  const { client } = req.query;


  if (req.method === 'GET') {
    // Retrieve the list of files for the client
    const dataPath = process.env.dataPath;
    const originalDir = process.cwd();
    process.chdir(originalDir);
    const botFolderPath = path.resolve(dataPath + client + "/" + bot + '/original/');

    try {
      const files = fs.readdirSync(botFolderPath)
        .filter((file) => !excludedFiles.includes(file)); // Exclude specified files

      if (files.length === 0) {
        res.status(200).json({
          files: [],
          empty: true,
        });
      } else {
        res.status(200).json({
          files,
          empty: false,
        });
      }
    } catch (error) {
      res.status(200).json({
        empty: true,
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete a file for the client
    const { fileName } = req.query;
    if (!fileName) {
      res.status(400).json({ error: 'Missing file name' });
      return;
    }
    const dataPath = process.env.dataPath;
    const botFolderPath = path.resolve(dataPath + client + "/" + bot + '/original/');
    const filePath = path.join(botFolderPath, fileName);

    try {
      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

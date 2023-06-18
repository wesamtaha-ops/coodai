const url = require('url');
const fs = require('fs');
const path = require('path');

export default (req, res) => {
  const clientFolder = req.query.client;

  if (!clientFolder) {
    throw new Error('Client name is required in the URL');
  }

  const dataPath = process.env.dataPath;
  const clientFolderPath = path.resolve(dataPath, clientFolder, 'original');
  const urlFilePath = path.join(clientFolderPath, 'urls.txt');

  if (req.method === 'GET') {
    try {
      const urls = fs.readFileSync(urlFilePath, 'utf8').split('\n').filter(Boolean);
      res.status(200).json({ urls });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching URLs' });
    }
  } else if (req.method === 'POST') {
    const urls = req.body.urls;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'Invalid URL data' });
    }

    try {
      const urlFileContent = urls.join('\n');
      fs.writeFileSync(urlFilePath, urlFileContent, 'utf8');
      res.status(200).json({ message: 'URLs updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating URLs' });
    }
  } else if (req.method === 'DELETE') {
    const { query } = url.parse(req.url, true);
    const lineIndex = parseInt(query.lineIndex);

    if (!Number.isInteger(lineIndex) || lineIndex < 0) {
      return res.status(400).json({ error: 'Invalid line index' });
    }

    try {
      const urls = fs.readFileSync(urlFilePath, 'utf8').split('\n').filter(Boolean);
      if (lineIndex >= urls.length) {
        return res.status(400).json({ error: 'Invalid line index' });
      }

      urls.splice(lineIndex, 1);
      const urlFileContent = urls.join('\n');
      fs.writeFileSync(urlFilePath, urlFileContent, 'utf8');
      res.status(200).json({ message: 'URL removed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error removing URL' });
    }
  } else {
    res.status(405).send('Method not allowed');
  }
};

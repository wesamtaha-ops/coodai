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
  const fileParam = req.query.file || 'urls.txt'; // Use the 'file' query parameter or default to 'url.txt'
  const filePath = path.join(clientFolderPath, fileParam);

  if (!fs.existsSync(clientFolderPath)) {
    fs.mkdirSync(clientFolderPath, { recursive: true });
  }
  // Check if styles.json and urls.txt files exist, and create them if they don't exist
  const requiredFiles = ['style.json', 'urls.txt', 'qa.txt'];
  requiredFiles.forEach((file) => {
    const filePath = path.join(clientFolderPath, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '', 'utf8');
    }
  });

  if (req.method === 'GET') {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let data;
      if (path.extname(fileParam) === '.json') {
        data = fileContent ? JSON.parse(fileContent) : "";
      } else {
        data = fileContent ? fileContent.split('\n').filter(Boolean) : "";
      }
      res.status(200).json({ data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching data', message: error.message });
    }
  } else if (req.method === 'POST') {
    const data = req.body.urls;
    if (!data) {
      return res.status(400).json({ error: 'Invalid data'});
    }

    try {
      let fileContent;
      if (path.extname(fileParam) === '.json') {
        fileContent = JSON.stringify(data);
      } else {
        fileContent = data.join('\n');
      }
      fs.writeFileSync(filePath, fileContent, 'utf8');
      res.status(200).json({ message: 'Data updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating data' });
    }
  } else if (req.method === 'DELETE') {
    const { query } = url.parse(req.url, true);
    const lineIndex = parseInt(query.lineIndex);

    if (!Number.isInteger(lineIndex) || lineIndex < 0) {
      return res.status(400).json({ error: 'Invalid line index' });
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      let data;
      if (path.extname(fileParam) === '.json') {
        data = JSON.parse(fileContent);
        if (!Array.isArray(data)) {
          return res.status(400).json({ error: 'Invalid data format' });
        }
      } else {
        data = fileContent.split('\n').filter(Boolean);
      }

      if (lineIndex >= data.length) {
        return res.status(400).json({ error: 'Invalid line index' });
      }

      data.splice(lineIndex, 1);
      let updatedFileContent;
      if (path.extname(fileParam) === '.json') {
        updatedFileContent = JSON.stringify(data);
      } else {
        updatedFileContent = data.join('\n');
      }
      fs.writeFileSync(filePath, updatedFileContent, 'utf8');
      res.status(200).json({ message: 'Data removed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error removing data' });
    }
  } else {
    res.status(405).send('Method not allowed');
  }
};

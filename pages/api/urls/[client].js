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
  const fileParam = req.query.file || 'url.txt'; // Use the 'file' query parameter or default to 'url.txt'
  const filePath = path.join(clientFolderPath, fileParam);

  if (req.method === 'GET') {
    try {
      let fileContent;
      if (fs.existsSync(filePath)) {
        fileContent = fs.readFileSync(filePath, 'utf8');
      } else {
        if (fileParam === 'styles.json') {
          const defaultStyles = {
            // Default styles object
            mainBG: '#1e252d',
            mainFont: 'Almarai',
            chatIcon: 'http://localhost:3999/chatIcon.png',
            userIcon: 'https://cdn.jawwy.tv/9/avatar-smile.svg',
            messageBG: '#2c3033',
            messageColor: '#ffffff',
            promptBG: '#2c3033',
            promptColor: '#fff',
            submitBG: '#ff6a39',
          };
          fileContent = JSON.stringify(defaultStyles);
        } else {
          fileContent = '';
        }
        fs.writeFileSync(filePath, fileContent, 'utf8');
      }

      let data;
      if (path.extname(fileParam) === '.json') {
        data = JSON.parse(fileContent);
      } else {
        data = fileContent.split('\n').filter(Boolean);
      }
      res.status(200).json({ data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  } else if (req.method === 'POST') {
    // Rest of the code remains the same
    // ...
  } else if (req.method === 'DELETE') {
    // Rest of the code remains the same
    // ...
  } else {
    res.status(405).send('Method not allowed');
  }
};

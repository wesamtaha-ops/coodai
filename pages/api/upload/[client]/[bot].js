const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const { IncomingForm } = formidable;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default (req, res) => {
  if (req.method === 'POST') {
    const form = new IncomingForm();
    const botFolder = req.query.bot;
    const clientFolder = req.query.client;

    if (!botFolder) {
      throw new Error('Client name is required in the URL');
    }


    const dataPath = process.env.dataPath;
    
    form.uploadDir = path.resolve(dataPath + clientFolder + '/' + botFolder + '/original/');
    fs.mkdirSync(form.uploadDir, { recursive: true });


    form.on('file', (name, file) => {
      console.log('Uploaded file', file.originalFilename);
      const oldFilePath = path.join(form.uploadDir, file.newFilename);
      const newFilePath = path.join(form.uploadDir, file.originalFilename);

      fs.rename(oldFilePath, newFilePath, (err) => {
        if (err) throw err;
        console.log('Rename complete!');
      });
    });


    form.on('error', (err) => {
      console.log('An error has occurred: \n' + err);
    });

    form.on('end', () => {
      res.status(200).send('Upload completed');
    });

    form.parse(req);

  } else {
    res.status(405).send('Method not allowed'); // Only POST method is allowed
  }
};

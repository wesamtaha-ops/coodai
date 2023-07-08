import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { client } = req.query;
  const { bot } = req.query;

  if (req.method === 'GET') {
    try {
      const dataPath = process.env.dataPath;
      const botFolderPath = path.resolve(dataPath, client, bot, 'original');
      const qaFilePath = path.join(botFolderPath, 'qa.txt');

      if (!fs.existsSync(qaFilePath)) {
        fs.writeFileSync(qaFilePath, '', 'utf8');
      }

      const qaData = fs.readFileSync(qaFilePath, 'utf8').trim().split('\n');
      const qaLines = qaData.filter((line) => line.length >= 5);
      const questions = qaLines.map((line) => line.split('|')[0]);
      const answers = qaLines.map((line) => line.split('|')[1]);
      res.status(200).json({ questions, answers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching QA data' });
    }
  } else if (req.method === 'POST') {
    const { questions, answers } = req.body;

    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Invalid QA data' });
      return;
    }

    try {
      const dataPath = process.env.dataPath;
      const botFolderPath = path.resolve(dataPath, client,bot, 'original');
      const qaFilePath = path.join(botFolderPath, 'qa.txt');
      const qaLines = questions.map((question, index) =>
        `${question.trim()}|${answers[index].trim()}`
      );
      const qaContent = qaLines.filter((line) => line.length >= 5).join('\n'); // Filter lines with length >= 5 characters
      fs.writeFileSync(qaFilePath, qaContent, 'utf8');
      res.status(200).json({ message: 'QA data updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating QA data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

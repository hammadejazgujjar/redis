import express from 'express';
import { emailQueue } from './queue.js';

const app = express();

app.use(express.json());

app.post('/welcome-email', async (req, res) => {
  const job = {
    to: req.body.to,
    subject: req.body.subject || 'No subject',
    body: req.body.body || 'No body',
    createdAt: new Date().toISOString(),
  };

  const worker = await emailQueue.add('send-welcome-email', job,{
    attempts: 3, // Number of retry attempts
    backoff: {
      type: 'exponential', // Backoff strategy
      delay: 5000, // Initial delay in milliseconds
    },
  });

  res.json({ queued: true, job, message: 'Email added to queue',jobId: worker.id ,jobName: worker.name});
});

app.listen(3000, () => {
  console.log('Server is running on port http://localhost:3000');
}); 
// Minimal working API to restore the site
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Basic endpoints to get site working
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio CMS API', status: 'running' });
});

app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Sample Project',
        subtitle: 'Portfolio is loading...',
        year: 2024,
        category: 'works',
        slug: 'sample-project',
        coming_soon: false,
        main_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      }
    ],
    total: 1
  });
});

app.get('/api/about', (req, res) => {
  res.json({
    success: true,
    data: { content: 'Portfolio is being restored...' }
  });
});

app.get('/api/media', (req, res) => {
  res.json({ success: true, data: [], total: 0 });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
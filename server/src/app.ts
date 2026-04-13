import express from 'express';
import cors from 'cors';
import path from 'path';
import componentRoutes from './routes/component.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve federation component files (JS, CSS, JSON, sourcemaps) at /static/{uuid}/
const STORAGE_DIR = path.resolve(__dirname, '../storage/components');
app.use('/static', express.static(STORAGE_DIR, {
  setHeaders: (res, filePath) => {
    // Ensure correct MIME types for federation assets
    if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  },
}));

app.use('/components', componentRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Component Registry Server running on port ${PORT}`);
});

export default app;

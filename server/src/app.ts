import express from 'express';
import componentRoutes from './routes/component.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/components', componentRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Component Registry Server running on port ${PORT}`);
});

export default app;

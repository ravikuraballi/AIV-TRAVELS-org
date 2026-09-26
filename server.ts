import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.resolve('data/db.json');

app.use(express.json());

// Ensure data folder exists
if (!fs.existsSync(path.resolve('data'))) {
  fs.mkdirSync(path.resolve('data'), { recursive: true });
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AIV Travels Backend', timestamp: new Date().toISOString() });
});

// Mock/Live Razorpay payment order generation endpoint
app.post('/api/payments/create-order', (req: Request, res: Response) => {
  const { amount, bookingId, customerPhone } = req.body;
  const orderId = `order_${Math.random().toString(36).substring(2, 10)}`;
  res.json({
    success: true,
    orderId,
    amount: amount || 500,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    bookingId,
    customerPhone,
    note: 'Razorpay sandbox credentials simulated. For production, set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.',
  });
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AIV Travels application server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

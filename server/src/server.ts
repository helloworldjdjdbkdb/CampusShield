import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, () => {
  console.log(`🛡️  CampusShield API Server running on http://localhost:${PORT}`);
  console.log(`🔒 Health check: http://localhost:${PORT}/api/health`);
});

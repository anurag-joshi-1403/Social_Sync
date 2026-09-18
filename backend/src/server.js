require('dotenv').config();

// Local-only escape hatch: some ISPs/networks fail the MongoDB Atlas SRV lookup.
// Set FORCE_PUBLIC_DNS=true in .env to route lookups via Google's resolvers.
// Never enable this in a hosted environment — it breaks internal/VPC DNS.
if (process.env.FORCE_PUBLIC_DNS === 'true') {
  require('dns').setServers(['8.8.8.8', '8.8.4.4']);
  console.log('🌐 DNS override active (FORCE_PUBLIC_DNS=true)');
}

const app = require('./app');
const connectDB = require('./config/db');
const { startScheduler } = require('./jobs/scheduler');

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  startScheduler();
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const weatherService = require('./services/weatherService');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.send('OK'));

// Cron job to run daily at 8:00 AM server time
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily weather update job...');
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' }
    });
    for (const customer of customers) {
      await weatherService.dispatchWeatherUpdate(customer);
    }
    console.log('Daily weather update job completed successfully.');
  } catch (error) {
    console.error('Error during weather cron job:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/customers', authMiddleware(['ADMIN']), async (req, res) => {
    try {
        const customers = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true,
                createdAt: true
            }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete customer
router.delete('/customers/:id', authMiddleware(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

const weatherService = require('../services/weatherService');

// Edit customer
router.put('/customers/:id', authMiddleware(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, city, password } = req.body;
        let updateData = { name, email, phone, city };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json({ message: 'Customer updated successfully', user: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Trigger weather update for specific customer
router.post('/customers/:id/trigger', authMiddleware(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await prisma.user.findUnique({ where: { id } });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await weatherService.dispatchWeatherUpdate(customer);
        res.json({ message: 'Weather update dispatched' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error triggering update' });
    }
});

// Trigger weather update for ALL customers
router.post('/customers/trigger-all', authMiddleware(['ADMIN']), async (req, res) => {
    try {
        const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });

        // Process asynchronously so we don't block the request
        Promise.allSettled(customers.map(c => weatherService.dispatchWeatherUpdate(c)));

        res.json({ message: `Updates dispatching for ${customers.length} customers` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error triggering updates' });
    }
});

module.exports = router;

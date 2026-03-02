const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get customer profile
router.get('/profile', authMiddleware(['CUSTOMER']), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update customer profile
router.put('/profile', authMiddleware(['CUSTOMER']), async (req, res) => {
    try {
        const { name, email, phone, city } = req.body;

        // Check if new email or phone already exists in other users
        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }],
                NOT: { id: req.user.id }
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Email or phone already in use' });
        }

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { name, email, phone, city },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                city: true
            }
        });

        res.json({ message: 'Profile updated successfully', user: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

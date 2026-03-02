const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Customer Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, city, password } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email or phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                city,
                password: hashedPassword,
                role: 'CUSTOMER'
            }
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin and Customer Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Default admin creation block on first login try if admin doesn't exist
        if (email === 'admin@admin.com') {
            const adminExists = await prisma.user.findFirst({ where: { email: 'admin@admin.com' } });
            if (!adminExists) {
                const hashedAdminPassword = await bcrypt.hash('admin123', 10);
                await prisma.user.create({
                    data: {
                        name: 'Admin',
                        email: 'admin@admin.com',
                        phone: '0000000000',
                        city: 'none',
                        password: hashedAdminPassword,
                        role: 'ADMIN'
                    }
                });
            }
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const Expense = require('./models/Expense');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to verify token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token is not valid' });
        req.user = user;
        next();
    });
};

router.post('/', authenticate, async (req, res) => {
    try {
        const expense = new Expense({ ...req.body, userId: req.user.id });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/', authenticate, async (req, res) => {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(expenses);
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(expense);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

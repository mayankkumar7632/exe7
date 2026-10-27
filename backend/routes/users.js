const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');

const router = express.Router();

router.get('/employees', auth, admin, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select(
      '-password'
    );
    res.json(employees);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/admins', auth, async (req, res) => {
  try {
    if (req.user.role === 'employee' && !req.user.approved) {
      return res
        .status(403)
        .json({ msg: 'Your account is not approved yet' });
    }
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/approve/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.approved = true;
    await user.save();
    res.json({ msg: 'User approved', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  empid: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  grant: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leave', leaveSchema);

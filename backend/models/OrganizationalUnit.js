const mongoose = require('mongoose');

const organizationalUnitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['News Management', 'Software Reviews', 'Hardware Reviews', 'Opinion Publishing']
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  divisions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrganizationalUnit', organizationalUnitSchema);


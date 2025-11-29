const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Division name is required']
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  organizationalUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationalUnit',
    required: [true, 'Organizational unit is required']
  },
  description: String,
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Division', divisionSchema);


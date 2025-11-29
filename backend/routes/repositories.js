/**
 * Repository Routes
 * 
 * Handles all credential repository and credential management endpoints.
 * Implements role-based access control and division-level permissions.
 * 
 * Endpoints:
 * - GET /api/repositories/accessible - Get user's accessible repositories
 * - GET /api/repositories/search - Search credentials across repositories
 * - GET /api/repositories/:divisionId - Get division's credential repository
 * - POST /api/repositories/:divisionId/credentials - Add new credential
 * - PUT /api/repositories/credentials/:credentialId - Update credential
 * - DELETE /api/repositories/credentials/:credentialId - Soft delete credential
 * - GET /api/repositories/credentials/:credentialId/access - View credential (logs access)
 * 
 * Security:
 * - All routes protected with JWT authentication
 * - Division access checks for non-admin users
 * - Role-based permissions (user, management, admin)
 * - Activity logging for audit trail
 * 
 * @module routes/repositories
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const CredentialRepository = require('../models/CredentialRepository');
const Division = require('../models/Division');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { protect, checkDivisionAccess, authorize } = require('../middleware/auth');

// @route   GET /api/repositories/search
// @desc    Search credentials across accessible repositories
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        credentials: []
      });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');

    // Get user's accessible divisions
    const user = await User.findById(req.user._id)
      .populate('divisions', '_id');

    let divisionIds = [];
    
    if (user.role === 'admin') {
      // Admin can search all divisions
      const allDivisions = await Division.find({ isActive: true }).select('_id');
      divisionIds = allDivisions.map(d => d._id);
    } else {
      // Regular users can only search their assigned divisions
      divisionIds = user.divisions.map(div => 
        div._id ? div._id : div
      );
    }

    // Find repositories for accessible divisions
    const repositories = await CredentialRepository.find({
      division: { $in: divisionIds }
    })
      .populate('division', 'name code organizationalUnit');

    // Search credentials across all accessible repositories
    const matchingCredentials = [];
    
    repositories.forEach(repo => {
      const matched = (repo.credentials || []).filter(cred => {
        if (cred.isActive === false) return false;
        
        return (
          searchRegex.test(cred.title) ||
          searchRegex.test(cred.username) ||
          searchRegex.test(cred.url) ||
          searchRegex.test(cred.category) ||
          (cred.notes && searchRegex.test(cred.notes)) ||
          (cred.tags && cred.tags.some(tag => searchRegex.test(tag)))
        );
      });

      matched.forEach(cred => {
        matchingCredentials.push({
          ...cred.toObject(),
          division: {
            _id: repo.division._id,
            name: repo.division.name,
            code: repo.division.code,
            organizationalUnit: repo.division.organizationalUnit
          },
          repositoryId: repo._id
        });
      });
    });

    // Limit results to 20
    const limitedResults = matchingCredentials.slice(0, 20);

    res.json({
      success: true,
      credentials: limitedResults,
      total: matchingCredentials.length
    });
  } catch (error) {
    console.error('Search credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/repositories/accessible
// @desc    Get user's accessible repositories
// @access  Private
router.get('/accessible', protect, async (req, res) => {
  try {
    // Ensure user divisions are populated
    const user = await User.findById(req.user._id)
      .populate('divisions', '_id name code organizationalUnit')
      .populate('organizationalUnits', '_id name code');
    
    let divisions;
    
    if (user.role === 'admin') {
      // Admin can see all divisions
      divisions = await Division.find({ isActive: true })
        .populate('organizationalUnit', 'name code');
    } else {
      // Regular users see only their assigned divisions
      // Handle both ObjectId and populated division objects
      const divisionIds = user.divisions.map(div => 
        div._id ? div._id.toString() : div.toString()
      );
      
      divisions = await Division.find({
        _id: { $in: divisionIds },
        isActive: true
      }).populate('organizationalUnit', 'name code');
    }

    res.json({
      success: true,
      divisions: divisions || []
    });
  } catch (error) {
    console.error('Get accessible repositories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/repositories/:divisionId
// @desc    Get specific division's credentials
// @access  Private (with division access check)
router.get('/:divisionId', protect, checkDivisionAccess, async (req, res) => {
  try {
    let repository = await CredentialRepository.findOne({
      division: req.params.divisionId
    })
      .populate({
        path: 'division',
        select: 'name code organizationalUnit',
        populate: {
          path: 'organizationalUnit',
          select: 'name code'
        }
      })
      .populate('credentials.createdBy', 'username email')
      .populate('credentials.lastUpdatedBy', 'username email');

    // If repository doesn't exist, create it (each division should have its own repository)
    if (!repository) {
      // Verify division exists
      const division = await Division.findById(req.params.divisionId);
      if (!division) {
        return res.status(404).json({
          success: false,
          message: 'Division not found'
        });
      }

      // Create empty repository for this division
      repository = await CredentialRepository.create({
        division: req.params.divisionId,
        credentials: []
      });

      // Populate the newly created repository
      repository = await CredentialRepository.findById(repository._id)
        .populate({
          path: 'division',
          select: 'name code organizationalUnit',
          populate: {
            path: 'organizationalUnit',
            select: 'name code'
          }
        })
        .populate('credentials.createdBy', 'username email')
        .populate('credentials.lastUpdatedBy', 'username email');
    }

    // Filter out inactive credentials
    const activeCredentials = (repository.credentials || []).filter(
      cred => cred.isActive !== false
    );

    res.json({
      success: true,
      repository: {
        ...repository.toObject(),
        credentials: activeCredentials
      }
    });
  } catch (error) {
    console.error('Get repository error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/repositories/:divisionId/credentials
// @desc    Add new credential
// @access  Private (user, management, admin)
router.post('/:divisionId/credentials', protect, checkDivisionAccess, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('url').trim().notEmpty().withMessage('URL is required'),
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('category').optional().isIn(['WordPress', 'Server', 'Database', 'Financial', 'API', 'Other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let repository = await CredentialRepository.findOne({
      division: req.params.divisionId
    });

    // Create repository if it doesn't exist
    if (!repository) {
      repository = await CredentialRepository.create({
        division: req.params.divisionId,
        credentials: []
      });
    }

    const newCredential = {
      ...req.body,
      createdBy: req.user._id
    };

    repository.credentials.push(newCredential);
    await repository.save();

    const savedCredential = repository.credentials[repository.credentials.length - 1];

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'credential_add',
      resourceType: 'credential',
      resourceId: savedCredential._id,
      details: {
        divisionId: req.params.divisionId,
        title: savedCredential.title,
        category: savedCredential.category
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      credential: savedCredential
    });
  } catch (error) {
    console.error('Add credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/repositories/credentials/:credentialId
// @desc    Update credential
// @access  Private (management, admin only)
router.put('/credentials/:credentialId', protect, authorize('management', 'admin'), [
  body('title').optional().trim().notEmpty(),
  body('url').optional().trim().notEmpty(),
  body('username').optional().trim().notEmpty(),
  body('password').optional().notEmpty(),
  body('category').optional().isIn(['WordPress', 'Server', 'Database', 'Financial', 'API', 'Other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const repository = await CredentialRepository.findOne({
      'credentials._id': req.params.credentialId
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Check division access (unless admin)
    if (req.user.role !== 'admin') {
      const hasAccess = req.user.divisions.some(
        div => div.toString() === repository.division.toString()
      );
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this division'
        });
      }
    }

    const credential = repository.credentials.id(req.params.credentialId);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Update credential fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        credential[key] = req.body[key];
      }
    });

    credential.lastUpdatedBy = req.user._id;
    await repository.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'credential_edit',
      resourceType: 'credential',
      resourceId: credential._id,
      details: {
        divisionId: repository.division.toString(),
        title: credential.title
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      credential
    });
  } catch (error) {
    console.error('Update credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/repositories/credentials/:credentialId
// @desc    Soft delete credential
// @access  Private (management, admin only)
router.delete('/credentials/:credentialId', protect, authorize('management', 'admin'), async (req, res) => {
  try {
    const repository = await CredentialRepository.findOne({
      'credentials._id': req.params.credentialId
    });

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Check division access (unless admin)
    if (req.user.role !== 'admin') {
      const hasAccess = req.user.divisions.some(
        div => div.toString() === repository.division.toString()
      );
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this division'
        });
      }
    }

    const credential = repository.credentials.id(req.params.credentialId);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    credential.isActive = false;
    credential.lastUpdatedBy = req.user._id;
    await repository.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'credential_delete',
      resourceType: 'credential',
      resourceId: credential._id,
      details: {
        divisionId: repository.division.toString(),
        title: credential.title
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Credential deleted successfully'
    });
  } catch (error) {
    console.error('Delete credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/repositories/search
// @desc    Search credentials across accessible repositories
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        credentials: []
      });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');

    // Get user's accessible divisions
    const user = await User.findById(req.user._id)
      .populate('divisions', '_id');

    let divisionIds = [];
    
    if (user.role === 'admin') {
      // Admin can search all divisions
      const allDivisions = await Division.find({ isActive: true }).select('_id');
      divisionIds = allDivisions.map(d => d._id);
    } else {
      // Regular users can only search their assigned divisions
      divisionIds = user.divisions.map(div => 
        div._id ? div._id : div
      );
    }

    // Find repositories for accessible divisions
    const repositories = await CredentialRepository.find({
      division: { $in: divisionIds }
    })
      .populate('division', 'name code organizationalUnit');

    // Search credentials across all accessible repositories
    const matchingCredentials = [];
    
    repositories.forEach(repo => {
      const matched = (repo.credentials || []).filter(cred => {
        if (cred.isActive === false) return false;
        
        return (
          searchRegex.test(cred.title) ||
          searchRegex.test(cred.username) ||
          searchRegex.test(cred.url) ||
          searchRegex.test(cred.category) ||
          (cred.notes && searchRegex.test(cred.notes)) ||
          (cred.tags && cred.tags.some(tag => searchRegex.test(tag)))
        );
      });

      matched.forEach(cred => {
        matchingCredentials.push({
          ...cred.toObject(),
          division: {
            _id: repo.division._id,
            name: repo.division.name,
            code: repo.division.code,
            organizationalUnit: repo.division.organizationalUnit
          },
          repositoryId: repo._id
        });
      });
    });

    // Limit results to 20
    const limitedResults = matchingCredentials.slice(0, 20);

    res.json({
      success: true,
      credentials: limitedResults,
      total: matchingCredentials.length
    });
  } catch (error) {
    console.error('Search credentials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/repositories/credentials/:credentialId/access
// @desc    Log credential access
// @access  Private
router.get('/credentials/:credentialId/access', protect, async (req, res) => {
  try {
    const repository = await CredentialRepository.findOne({
      'credentials._id': req.params.credentialId
    })
      .populate('division', '_id');

    if (!repository) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Check division access (unless admin)
    if (req.user.role !== 'admin') {
      // Ensure user divisions are populated
      const user = await User.findById(req.user._id)
        .populate('divisions', '_id');
      
      const divisionId = repository.division._id 
        ? repository.division._id.toString() 
        : repository.division.toString();
      
      const hasAccess = user.divisions.some(
        div => {
          const divId = div._id ? div._id.toString() : div.toString();
          return divId === divisionId;
        }
      );
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this division'
        });
      }
    }

    const credential = repository.credentials.id(req.params.credentialId);
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Update access tracking
    credential.lastAccessed = new Date();
    credential.accessCount += 1;
    await repository.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'credential_view',
      resourceType: 'credential',
      resourceId: credential._id,
      details: {
        divisionId: repository.division.toString(),
        title: credential.title
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Return decrypted password
    const decryptedPassword = credential.getDecryptedPassword();

    res.json({
      success: true,
      credential: {
        ...credential.toObject(),
        password: decryptedPassword
      }
    });
  } catch (error) {
    console.error('Access credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


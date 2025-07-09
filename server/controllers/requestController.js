import BloodRequest from '../models/BloodRequest.js';
import Donor from '../models/Donor.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for proof documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'proofs');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'proof-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to get admin user ID
const getAdminUserId = async () => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    return adminUser ? adminUser._id : null;
  } catch (error) {
    console.error('Error finding admin user:', error);
    return null;
  }
};

export const getRequestsForDonors = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get donor profile
    const donor = await Donor.findOne({ user: userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found. Please register as a donor first.' });
    }

    if (!donor.isVerified) {
      return res.status(403).json({ message: 'Your donor profile is not verified yet. Please wait for admin approval.' });
    }

    // Get compatible blood requests
    const compatibleBloodGroups = getCompatibleBloodGroups(donor.bloodGroup);
    
    const requests = await BloodRequest.find({
      bloodGroup: { $in: compatibleBloodGroups },
      status: { $in: ['pending', 'partial'] },
      requiredDate: { $gte: new Date() },
      'assignedDonors.donor': { $ne: donor._id }
    }).sort({ urgency: -1, createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get requests for donors error:', error);
    res.status(500).json({ message: 'Failed to get requests', error: error.message });
  }
};

export const getMyAssignedRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const donor = await Donor.findOne({ user: userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const requests = await BloodRequest.find({
      'assignedDonors.donor': donor._id
    }).sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get my assigned requests error:', error);
    res.status(500).json({ message: 'Failed to get assigned requests', error: error.message });
  }
};

export const respondToRequest = async (req, res) => {
  try {
    const { requestId, status, response } = req.body;
    const userId = req.user.userId;

    const donor = await Donor.findOne({ user: userId }).populate('user');
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Update donor's response
    const assignmentIndex = request.assignedDonors.findIndex(
      assignment => assignment.donor.toString() === donor._id.toString()
    );

    if (assignmentIndex === -1) {
      // If not assigned, add new assignment
      request.assignedDonors.push({
        donor: donor._id,
        assignedAt: new Date(),
        status,
        response: response || ''
      });
    } else {
      // Update existing assignment
      request.assignedDonors[assignmentIndex].status = status;
      request.assignedDonors[assignmentIndex].response = response || '';
    }
 
    await request.save();
 
    // Create notification for admin - Get actual admin user ID
    const adminUserId = await getAdminUserId();
    if (adminUserId) {
      await Notification.create({
        recipient: adminUserId,
        type: 'response',
        title: 'Donor Response Received',
        message: `${donor.user.fullName} ${status} the blood request for ${request.patientName}`,
        relatedId: request._id
      });
    }
 
    res.json({ message: 'Response recorded successfully' });
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ message: 'Failed to respond to request', error: error.message });
  }
};
 
export const uploadProofDocument = [
  upload.single('proof'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
 
      const { requestId } = req.body;
      const userId = req.user.userId;
 
      // Find donor
      const donor = await Donor.findOne({ user: userId }).populate('user');
      if (!donor) {
        return res.status(404).json({ message: 'Donor profile not found' });
      }
 
      // Find blood request
      const request = await BloodRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Blood request not found' });
      }
 
      // Find the donor's assignment
      const assignmentIndex = request.assignedDonors.findIndex(
        assignment => assignment.donor.toString() === donor._id.toString()
      );
 
      if (assignmentIndex === -1) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
 
      // Create file path relative to server root
      const relativePath = `/uploads/proofs/${req.file.filename}`;
 
      // Add proof document to assignment
      const proofDocument = {
        fileName: req.file.originalname,
        filePath: relativePath,
        uploadedAt: new Date()
      };
 
      if (!request.assignedDonors[assignmentIndex].proofDocuments) {
        request.assignedDonors[assignmentIndex].proofDocuments = [];
      }
      
      request.assignedDonors[assignmentIndex].proofDocuments.push(proofDocument);
      await request.save();
 
      // Create notification for admin
      const adminUserId = await getAdminUserId();
      if (adminUserId) {
        await Notification.create({
          recipient: adminUserId,
          type: 'general',
          title: 'Proof Document Uploaded',
          message: `${donor.user?.fullName || 'A donor'} uploaded proof for donation to ${request.patientName}`,
          relatedId: request._id
        });
      }
 
      res.json({
        message: 'Proof document uploaded successfully',
        document: proofDocument
      });
    } catch (error) {
      console.error('Upload proof error:', error);
      res.status(500).json({ message: 'Failed to upload proof document', error: error.message });
    }
  }
];
 
export const markRequestCompleted = async (req, res) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.userId;
 
    // Find donor
    const donor = await Donor.findOne({ user: userId }).populate('user');
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }
 
    // Find blood request
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }
 
    // Find and update the donor's assignment
    const assignmentIndex = request.assignedDonors.findIndex(
      assignment => assignment.donor.toString() === donor._id.toString()
    );
 
    if (assignmentIndex === -1) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
 
    // Update assignment status to completed
    request.assignedDonors[assignmentIndex].status = 'completed';
    request.assignedDonors[assignmentIndex].completedAt = new Date();
 
    // Update donor's total donations
    donor.totalDonations += 1;
    donor.lastDonationDate = new Date();
 
    await Promise.all([request.save(), donor.save()]);
 
    // Create notifications
    const adminUserId = await getAdminUserId();
    if (adminUserId) {
      await Notification.create({
        recipient: adminUserId,
        type: 'general',
        title: 'Donation Completed',
        message: `${donor.user.fullName} completed blood donation for ${request.patientName} at ${request.hospital}`,
        relatedId: request._id
      });
    }
 
    // Check if all assigned donors have completed and update request status
    const allCompleted = request.assignedDonors.every(assignment => 
      assignment.status === 'completed' || assignment.status === 'rejected'
    );
    
    if (allCompleted) {
      const completedCount = request.assignedDonors.filter(assignment => 
        assignment.status === 'completed'
      ).length;
      
      if (completedCount >= request.unitsNeeded) {
        request.status = 'fulfilled';
      } else if (completedCount > 0) {
        request.status = 'partial';
      }
      await request.save();
    }
 
    res.json({
      message: 'Request marked as completed successfully',
      request
    });
  } catch (error) {
    console.error('Mark completed error:', error);
    res.status(500).json({ message: 'Failed to mark request as completed', error: error.message });
  }
};
 
// Helper functions
const getCompatibleBloodGroups = (donorBloodGroup) => {
  const compatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };
  return compatibility[donorBloodGroup] || [];
};
 
const notifyCompatibleDonors = async (bloodRequest) => {
  try {
    const compatibleDonors = await Donor.find({
      bloodGroup: { $in: getCompatibleBloodGroups(bloodRequest.bloodGroup) },
      isVerified: true,
      status: 'active'
    }).populate('user');
 
    const notifications = compatibleDonors.map(donor => ({
      recipient: donor.user._id,
      type: 'blood_request',
      title: 'New Blood Request',
      message: `Urgent: ${bloodRequest.bloodGroup} blood needed for ${bloodRequest.patientName} at ${bloodRequest.hospital}`,
      relatedId: bloodRequest._id
    }));
 
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error notifying donors:', error);
  }
};
 
export const createBloodRequest = async (req, res) => {
  try {
    const requestData = req.body;
    
    const bloodRequest = new BloodRequest(requestData);
    await bloodRequest.save();
 
    // Notify compatible donors
    await notifyCompatibleDonors(bloodRequest);
 
    res.status(201).json({
      message: 'Blood request created successfully',
      request: bloodRequest
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({ message: 'Failed to create blood request', error: error.message });
  }
};
 
export const getBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('assignedDonors.donor', 'bloodGroup')
      .sort({ createdAt: -1 });
 
    res.json({ requests });
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({ message: 'Failed to get blood requests', error: error.message });
  }
};
 
export const getBloodRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id)
      .populate('assignedDonors.donor', 'bloodGroup user')
      .populate('assignedDonors.donor.user', 'fullName email phone');
 
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }
 
    res.json({ request });
  } catch (error) {
    console.error('Get blood request error:', error);
    res.status(500).json({ message: 'Failed to get blood request', error: error.message });
  }
};
 
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
 
    const request = await BloodRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
 
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }
 
    res.json({
      message: 'Request status updated successfully',
      request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Failed to update request status', error: error.message });
  }
};
 
export const assignDonorToRequest = async (req, res) => {
  try {
    const { requestId, donorId } = req.body;
 
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }
 
    const donor = await Donor.findById(donorId).populate('user');
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
 
    // Check if donor is already assigned
    const isAlreadyAssigned = request.assignedDonors.some(
      assignment => assignment.donor.toString() === donorId
    );
 
    if (isAlreadyAssigned) {
      return res.status(400).json({ message: 'Donor is already assigned to this request' });
    }
 
    // Add donor to assigned donors
    request.assignedDonors.push({
      donor: donorId,
      assignedAt: new Date(),
      status: 'pending'
    });
 
    await request.save();
 
    // Create notification for donor
    await Notification.create({
      recipient: donor.user._id,
      type: 'assignment',
      title: 'Blood Donation Assignment',
      message: `You have been assigned to donate ${request.bloodGroup} blood for ${request.patientName} at ${request.hospital}`,
      relatedId: request._id
    });
 
    res.json({
      message: 'Donor assigned successfully',
      request
    });
  } catch (error) {
    console.error('Assign donor error:', error);
    res.status(500).json({ message: 'Failed to assign donor', error: error.message });
  }
};
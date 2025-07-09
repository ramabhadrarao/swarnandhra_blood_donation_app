import User from '../models/User.js';
import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';
import Notification from '../models/Notification.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await Donor.countDocuments();
    const activeRequests = await BloodRequest.countDocuments({ status: { $in: ['pending', 'partial'] } });
    const completedRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });

    // Blood group distribution
    const bloodGroupStats = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Monthly registrations
    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalDonors,
        activeRequests,
        completedRequests,
        bloodGroupStats,
        monthlyRegistrations
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};

export const getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate('user', 'fullName email phone department year rollNumber')
      .sort({ createdAt: -1 });
    res.json({ donors });
  } catch (error) {
    console.error('Get all donors error:', error);
    res.status(500).json({ message: 'Failed to get donors', error: error.message });
  }
};

// Add this missing function
export const getAdminBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate({
        path: 'assignedDonors.donor',
        populate: {
          path: 'user',
          select: 'fullName email phone department year'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get admin blood requests error:', error);
    res.status(500).json({ message: 'Failed to get blood requests', error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
};

export const verifyDonor = async (req, res) => {
  try {
    const { donorId } = req.params;
    const { isVerified } = req.body;

    const donor = await Donor.findByIdAndUpdate(
      donorId,
      { isVerified },
      { new: true }
    ).populate('user', 'fullName email phone department year rollNumber');

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Create notification for donor
    await Notification.create({
      recipient: donor.user._id,
      type: 'verification',
      title: isVerified ? 'Donor Profile Verified' : 'Donor Profile Rejected',
      message: isVerified 
        ? 'Congratulations! Your donor profile has been verified. You can now receive blood donation requests.'
        : 'Your donor profile verification was not approved. Please contact admin for more information.',
      relatedId: donor._id
    });

    res.json({
      message: 'Donor verification status updated successfully',
      donor
    });
  } catch (error) {
    console.error('Verify donor error:', error);
    res.status(500).json({ message: 'Failed to verify donor', error: error.message });
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
      message: `You have been assigned to donate ${request.bloodGroup} blood for ${request.patientName} at ${request.hospital}. Please respond as soon as possible.`,
      relatedId: request._id,
      data: {
        requestId: request._id,
        patientName: request.patientName,
        hospital: request.hospital,
        urgency: request.urgency
      }
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

export const updateBloodRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await BloodRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate({
      path: 'assignedDonors.donor',
      populate: {
        path: 'user',
        select: 'fullName email phone'
      }
    });

    if (!request) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Notify assigned donors about status change
    if (request.assignedDonors.length > 0) {
      const notifications = request.assignedDonors.map(assignment => ({
        recipient: assignment.donor.user._id,
        type: 'general',
        title: 'Blood Request Status Updated',
        message: `The blood request for ${request.patientName} has been marked as ${status}.`,
        relatedId: request._id
      }));

      await Notification.insertMany(notifications);
    }

    res.json({
      message: 'Request status updated successfully',
      request
    });
  } catch (error) {
    console.error('Update blood request status error:', error);
    res.status(500).json({ message: 'Failed to update request status', error: error.message });
  }
};
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';

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
    ).populate('user', 'fullName email phone department year');

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json({
      message: 'Donor verification status updated successfully',
      donor
    });
  } catch (error) {
    console.error('Verify donor error:', error);
    res.status(500).json({ message: 'Failed to verify donor', error: error.message });
  }
};
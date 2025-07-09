import Donor from '../models/Donor.js';
import User from '../models/User.js';

export const registerDonor = async (req, res) => {
  try {
    const { bloodGroup, weight, lastDonationDate, medicalConditions, availability } = req.body;
    const userId = req.user.userId;

    // Check if user is already a donor
    const existingDonor = await Donor.findOne({ user: userId });
    if (existingDonor) {
      return res.status(400).json({ message: 'User is already registered as a donor' });
    }

    // Create donor
    const donor = new Donor({
      user: userId,
      bloodGroup,
      weight,
      lastDonationDate: lastDonationDate || null,
      medicalConditions: medicalConditions || [],
      availability
    });

    await donor.save();

    // Populate user details
    await donor.populate('user', 'fullName email phone department year');

    res.status(201).json({
      message: 'Donor registered successfully',
      donor
    });
  } catch (error) {
    console.error('Donor registration error:', error);
    res.status(500).json({ message: 'Donor registration failed', error: error.message });
  }
};

export const getDonorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const donor = await Donor.findOne({ user: userId }).populate('user', 'fullName email phone department year');

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    res.json({ donor });
  } catch (error) {
    console.error('Get donor profile error:', error);
    res.status(500).json({ message: 'Failed to get donor profile', error: error.message });
  }
};

export const updateDonorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    const donor = await Donor.findOneAndUpdate(
      { user: userId },
      updates,
      { new: true }
    ).populate('user', 'fullName email phone department year');

    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    res.json({
      message: 'Donor profile updated successfully',
      donor
    });
  } catch (error) {
    console.error('Update donor profile error:', error);
    res.status(500).json({ message: 'Failed to update donor profile', error: error.message });
  }
};

export const searchDonors = async (req, res) => {
  try {
    const { bloodGroup, availability, department, year } = req.query;
    
    let query = { status: 'active' };
    
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    
    if (availability) {
      query.availability = availability;
    }

    const donors = await Donor.find(query)
      .populate('user', 'fullName email phone department year')
      .sort({ createdAt: -1 });

    // Filter by department and year if provided
    let filteredDonors = donors;
    if (department || year) {
      filteredDonors = donors.filter(donor => {
        let match = true;
        if (department && donor.user.department !== department) match = false;
        if (year && donor.user.year !== parseInt(year)) match = false;
        return match;
      });
    }

    res.json({ donors: filteredDonors });
  } catch (error) {
    console.error('Search donors error:', error);
    res.status(500).json({ message: 'Failed to search donors', error: error.message });
  }
};

export const getDonorsList = async (req, res) => {
  try {
    const donors = await Donor.find({ status: 'active' })
      .populate('user', 'fullName email phone department year')
      .sort({ createdAt: -1 });

    res.json({ donors });
  } catch (error) {
    console.error('Get donors list error:', error);
    res.status(500).json({ message: 'Failed to get donors list', error: error.message });
  }
};
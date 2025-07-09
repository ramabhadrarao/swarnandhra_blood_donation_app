import BloodRequest from '../models/BloodRequest.js';
import Donor from '../models/Donor.js';

export const createBloodRequest = async (req, res) => {
  try {
    const requestData = req.body;
    
    const bloodRequest = new BloodRequest(requestData);
    await bloodRequest.save();

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

    const donor = await Donor.findById(donorId);
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

    res.json({
      message: 'Donor assigned successfully',
      request
    });
  } catch (error) {
    console.error('Assign donor error:', error);
    res.status(500).json({ message: 'Failed to assign donor', error: error.message });
  }
};
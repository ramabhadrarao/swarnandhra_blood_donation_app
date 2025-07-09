import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Heart, Phone, Mail, User, MapPin } from 'lucide-react';

interface Donor {
  _id: string;
  bloodGroup: string;
  weight: number;
  availability: string;
  isVerified: boolean;
  totalDonations: number;
  user: {
    fullName: string;
    email: string;
    phone: string;
    department: string;
    year: number;
  };
}

const SearchDonors: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    bloodGroup: '',
    availability: '',
    department: '',
    year: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const departments = [
    'Computer Science Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Information Technology',
    'Chemical Engineering',
    'Biotechnology'
  ];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [filters, donors]);

  const fetchDonors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/donors/list');
      setDonors(response.data.donors);
      setFilteredDonors(response.data.donors);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch donors');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = donors;

    if (filters.bloodGroup) {
      filtered = filtered.filter(donor => donor.bloodGroup === filters.bloodGroup);
    }

    if (filters.availability) {
      filtered = filtered.filter(donor => donor.availability === filters.availability);
    }

    if (filters.department) {
      filtered = filtered.filter(donor => donor.user.department === filters.department);
    }

    if (filters.year) {
      filtered = filtered.filter(donor => donor.user.year === parseInt(filters.year));
    }

    setFilteredDonors(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      bloodGroup: '',
      availability: '',
      department: '',
      year: ''
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Blood Donors</h1>
        <p className="text-gray-600">Search for blood donors in your college</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </h2>
          <button
            onClick={clearFilters}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={filters.bloodGroup}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              name="availability"
              value={filters.availability}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Availability</option>
              <option value="always">Always Available</option>
              <option value="monthly">Monthly</option>
              <option value="emergency">Emergency Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Search Results ({filteredDonors.length} donors found)
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {filteredDonors.length === 0 ? (
          <div className="text-center py-8">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No donors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredDonors.map((donor) => (
              <div key={donor._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 rounded-full p-3">
                      <User className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{donor.user.fullName}</h3>
                      <p className="text-sm text-gray-600">{donor.user.department}</p>
                      <p className="text-sm text-gray-500">Year {donor.user.year}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {donor.bloodGroup}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Availability</p>
                    <p className="font-medium capitalize">{donor.availability}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="font-medium">{donor.totalDonations}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <a
                        href={`mailto:${donor.user.email}`}
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </a>
                      <a
                        href={`tel:${donor.user.phone}`}
                        className="text-green-500 hover:text-green-700 flex items-center"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </a>
                    </div>
                    {donor.isVerified && (
                      <span className="text-green-600 text-xs font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDonors;
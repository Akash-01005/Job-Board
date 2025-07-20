import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../libs/axiosInstance.js';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const jobTypes = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...filters
      });

      const response = await axiosInstance.get(`/jobs?${params}`);
      setJobs(response.data.jobs);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      setError('Failed to fetch jobs. Please try again.');
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handlePageChange = (page) => {
    fetchJobs(page);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    const { min, max, currency = 'USD' } = salary;
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `${currency} ${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${currency} ${max.toLocaleString()}`;
    }
    return 'Not specified';
  };

  const getJobTypeBadge = (jobType) => {
    const colors = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-green-100 text-green-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-yellow-100 text-yellow-800'
    };
    return colors[jobType] || 'bg-gray-100 text-gray-800';
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover thousands of job opportunities with all the information you need. Its your future.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Jobs
                </label>
                <input
                  type="text"
                  id="search"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Job title, company, or keywords"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City, state, or remote"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  id="jobType"
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-8 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
              >
                Search Jobs
              </button>
            </div>
          </form>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {jobs.length} of {pagination.total} jobs
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
              <option>Most Recent</option>
              <option>Salary: High to Low</option>
              <option>Salary: Low to High</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      <Link to={`/jobs/${job._id}`} className="hover:text-indigo-600 transition-colors">
                        {job.title}
                      </Link>
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJobTypeBadge(job.jobType)}`}>
                      {job.jobType.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{job.company}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-lg font-semibold text-indigo-600">
                        ₹{job.minSalary?.toLocaleString('en-IN')} - ₹{job.maxSalary?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 line-clamp-2">
                    {job.description.substring(0, 200)}...
                  </p>
                </div>
                
                <div className="ml-6 flex flex-col items-end space-y-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/jobs/${job._id}/apply`}
                    className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {jobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs; 
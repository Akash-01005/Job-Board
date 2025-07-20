import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import axiosInstance from '../libs/axiosInstance.js';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resume: null
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      setError('Failed to fetch job details. Please try again.');
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      const formData = new FormData();
      formData.append('coverLetter', applicationData.coverLetter);
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }

      await axiosInstance.post(`/matching/apply/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowApplyModal(false);
      setApplicationData({ coverLetter: '', resume: null });
      // Show success message or redirect
      alert('Application submitted successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
          <Link
            to="/jobs"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/jobs"
                className="text-indigo-600 hover:text-indigo-500 mb-4 inline-flex items-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Jobs
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-xl text-gray-600 mt-2">{job.company}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getJobTypeBadge(job.jobType)}`}>
                {job.jobType.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium text-gray-900">
                      ₹{job.minSalary?.toLocaleString('en-IN')} - ₹{job.maxSalary?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Posted</p>
                    <p className="font-medium text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {job.createdBy && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Posted by</p>
                      <p className="font-medium text-gray-900">{job.createdBy.name}</p>
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-6" />

              {/* Show Apply button only if user is not the job poster and is a candidate */}
              {user && user.role === 'candidate' && job.createdBy && user._id !== job.createdBy._id && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Apply for this position
                </button>
              )}

              {/* Show different message for job poster */}
              {user && job.createdBy && user._id === job.createdBy._id && (
                <div className="text-center py-3 px-4 bg-gray-100 rounded-md">
                  <p className="text-gray-600 text-sm font-medium">You posted this job</p>
                  <p className="text-gray-500 text-xs mt-1">Applications will appear in your dashboard</p>
                </div>
              )}

              {/* Show login prompt for non-authenticated users */}
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Login to Apply
                </button>
              )}

              {/* Show role message for employers who didn't post this job */}
              {user && user.role === 'employer' && job.createdBy && user._id !== job.createdBy._id && (
                <div className="text-center py-3 px-4 bg-blue-50 rounded-md">
                  <p className="text-blue-600 text-sm font-medium">Employer Account</p>
                  <p className="text-blue-500 text-xs mt-1">Only candidates can apply for jobs</p>
                </div>
              )}

              <div className="mt-4 text-center">
                <button className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                  Save Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Apply for {job.title}</h3>
              
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    id="coverLetter"
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Tell us why you're interested in this position..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                    Resume (Optional)
                  </label>
                  <input
                    type="file"
                    id="resume"
                    onChange={(e) => setApplicationData(prev => ({ ...prev, resume: e.target.files[0] }))}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail; 
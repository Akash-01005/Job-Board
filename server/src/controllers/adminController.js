import Application from '../models/Application.js';
import Job from '../models/Job.js';
import ParsedResume from '../models/ParsedResume.js';
import User from '../models/User.js';

export const getApplicationsPerJob = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        appliedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const applications = await Application.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $group: {
          _id: '$jobId',
          jobTitle: { $first: '$job.title' },
          company: { $first: '$job.company' },
          totalApplications: { $sum: 1 },
          pendingApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          reviewedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
          },
          shortlistedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] }
          },
          rejectedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          hiredApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalApplications: -1 } }
    ]);
    
    res.json({
      applicationsPerJob: applications,
      totalJobs: applications.length,
      totalApplications: applications.reduce((sum, job) => sum + job.totalApplications, 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTopSkills = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const topSkills = await ParsedResume.aggregate([
      { $unwind: '$extractedFields.skills' },
      {
        $group: {
          _id: '$extractedFields.skills',
          count: { $sum: 1 },
          candidates: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          skill: '$_id',
          count: 1,
          uniqueCandidates: { $size: '$candidates' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    const totalCandidates = await ParsedResume.distinct('userId').count();
    
    res.json({
      topSkills,
      totalCandidates,
      totalSkills: topSkills.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalResumes = await ParsedResume.countDocuments();
    
    const recentJobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name company');
    
    const recentApplications = await Application.find()
      .sort({ appliedAt: -1 })
      .limit(10)
      .populate('jobId', 'title company')
      .populate('userId', 'name email');
    
    const jobTypes = await Job.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$jobType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      stats: {
        totalJobs,
        totalApplications,
        totalUsers,
        totalResumes
      },
      recentJobs,
      recentApplications,
      jobTypes,
      userRoles
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getApplicationStats = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const applications = await Application.find({ jobId })
      .populate('userId', 'name email')
      .sort({ appliedAt: -1 });
    
    const statusCounts = await Application.aggregate([
      { $match: { jobId: job._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const dailyApplications = await Application.aggregate([
      { $match: { jobId: job._id } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      job,
      applications,
      statusCounts,
      dailyApplications,
      totalApplications: applications.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 
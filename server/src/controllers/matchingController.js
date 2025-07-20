import Job from '../models/Job.js';
import ParsedResume from '../models/ParsedResume.js';
import Application from '../models/Application.js';

const calculateSkillMatch = (jobSkills, candidateSkills) => {
  if (!jobSkills || !candidateSkills || jobSkills.length === 0 || candidateSkills.length === 0) {
    return 0;
  }
  
  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
  const candidateSkillsLower = candidateSkills.map(skill => skill.toLowerCase());
  
  const matchingSkills = jobSkillsLower.filter(skill => 
    candidateSkillsLower.includes(skill)
  );
  
  return matchingSkills.length / jobSkillsLower.length;
};

const calculateTextSimilarity = (jobText, candidateText) => {
  const jobWords = jobText.toLowerCase().split(/\s+/);
  const candidateWords = candidateText.toLowerCase().split(/\s+/);
  
  const jobWordSet = new Set(jobWords);
  const candidateWordSet = new Set(candidateWords);
  
  const intersection = new Set([...jobWordSet].filter(x => candidateWordSet.has(x)));
  const union = new Set([...jobWordSet, ...candidateWordSet]);
  
  return intersection.size / union.size;
};

export const getJobRecommendations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const parsedResume = await ParsedResume.findOne({ userId: req.user._id })
      .sort({ parsedAt: -1 });
    
    if (!parsedResume) {
      return res.status(404).json({ message: 'No parsed resume found. Please upload your resume first.' });
    }
    
    const candidateSkills = parsedResume.extractedFields.skills || [];
    const candidateText = parsedResume.extractedFields.summary || '';
    
    const jobs = await Job.find({ isActive: true })
      .populate('createdBy', 'name company')
      .sort({ createdAt: -1 });
    
    const jobsWithScores = jobs.map(job => {
      const jobSkills = job.requirements || [];
      const jobText = `${job.title} ${job.description} ${job.company}`;
      
      const skillMatch = calculateSkillMatch(jobSkills, candidateSkills);
      const textSimilarity = calculateTextSimilarity(jobText, candidateText);
      
      const totalScore = (skillMatch * 0.7) + (textSimilarity * 0.3);
      
      return {
        ...job.toObject(),
        matchScore: Math.round(totalScore * 100),
        skillMatch: Math.round(skillMatch * 100),
        textSimilarity: Math.round(textSimilarity * 100)
      };
    });
    
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = jobsWithScores.slice(startIndex, endIndex);
    
    res.json({
      jobs: paginatedJobs,
      totalPages: Math.ceil(jobsWithScores.length / limit),
      currentPage: parseInt(page),
      total: jobsWithScores.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getCandidateRecommendations = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const parsedResumes = await ParsedResume.find()
      .populate('userId', 'name email')
      .sort({ parsedAt: -1 });
    
    const candidatesWithScores = parsedResumes.map(resume => {
      const candidateSkills = resume.extractedFields.skills || [];
      const candidateText = resume.extractedFields.summary || '';
      const jobSkills = job.requirements || [];
      const jobText = `${job.title} ${job.description} ${job.company}`;
      
      const skillMatch = calculateSkillMatch(jobSkills, candidateSkills);
      const textSimilarity = calculateTextSimilarity(jobText, candidateText);
      
      const totalScore = (skillMatch * 0.7) + (textSimilarity * 0.3);
      
      return {
        candidate: resume.userId,
        resume: resume,
        matchScore: Math.round(totalScore * 100),
        skillMatch: Math.round(skillMatch * 100),
        textSimilarity: Math.round(textSimilarity * 100)
      };
    });
    
    candidatesWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCandidates = candidatesWithScores.slice(startIndex, endIndex);
    
    res.json({
      candidates: paginatedCandidates,
      totalPages: Math.ceil(candidatesWithScores.length / limit),
      currentPage: parseInt(page),
      total: candidatesWithScores.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    
    const existingApplication = await Application.findOne({
      jobId,
      userId: req.user._id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }
    
    const application = new Application({
      jobId,
      userId: req.user._id,
      coverLetter
    });
    
    await application.save();
    
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 
import ParsedResume from '../models/ParsedResume.js';
import { parseFile, cleanupFile } from '../libs/fileParser.js';

const extractSkillsFromText = (text) => {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'TypeScript', 'Angular', 'Vue.js',
    'Express.js', 'Django', 'Flask', 'Spring Boot', 'PostgreSQL', 'MySQL',
    'Redis', 'Elasticsearch', 'GraphQL', 'REST API', 'Microservices',
    'Machine Learning', 'Data Science', 'DevOps', 'CI/CD', 'Agile'
  ];
  
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
};

const extractEducation = (text) => {
  const education = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('bachelor') || line.includes('master') || line.includes('phd') || 
        line.includes('university') || line.includes('college') || line.includes('degree')) {
      const degree = lines[i];
      const institution = lines[i + 1] || '';
      const year = lines[i + 2] || '';
      
      education.push({
        degree: degree.trim(),
        institution: institution.trim(),
        year: year.trim(),
        gpa: null
      });
    }
  }
  
  return education;
};

const extractExperience = (text) => {
  const experience = [];
  const sections = text.split(/(?:experience|work|employment)/i);
  
  if (sections.length > 1) {
    const experienceSection = sections[1];
    const lines = experienceSection.split('\n');
    
    let currentExp = {};
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('@') || line.includes('at')) {
        if (currentExp.title) {
          experience.push(currentExp);
        }
        currentExp = {
          title: line,
          company: '',
          duration: '',
          description: '',
          startDate: null,
          endDate: null
        };
      } else if (line && currentExp.title) {
        if (!currentExp.company) {
          currentExp.company = line;
        } else if (!currentExp.duration) {
          currentExp.duration = line;
        } else {
          currentExp.description += line + ' ';
        }
      }
    }
    if (currentExp.title) {
      experience.push(currentExp);
    }
  }
  
  return experience;
};

export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { originalname, filename, path: filePath, size } = req.file;
    const fileExtension = originalname.split('.').pop().toLowerCase();
    
    const text = await parseFile(filePath);
    
    const extractedFields = {
      skills: extractSkillsFromText(text),
      education: extractEducation(text),
      experience: extractExperience(text),
      contact: {
        phone: '',
        address: '',
        linkedin: ''
      },
      summary: text.substring(0, 500)
    };
    
    const parsedResume = new ParsedResume({
      userId: req.user._id,
      originalFileName: originalname,
      extractedFields,
      fileSize: size,
      fileType: fileExtension,
      confidence: 0.8
    });
    
    await parsedResume.save();
    
    cleanupFile(filePath);
    
    res.json({
      message: 'Resume parsed successfully',
      parsedData: extractedFields,
      resumeId: parsedResume._id
    });
  } catch (error) {
    if (req.file) {
      cleanupFile(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getParsedResume = async (req, res) => {
  try {
    const parsedResume = await ParsedResume.findOne({ userId: req.user._id })
      .sort({ parsedAt: -1 });
    
    if (!parsedResume) {
      return res.status(404).json({ message: 'No parsed resume found' });
    }
    
    res.json(parsedResume);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 
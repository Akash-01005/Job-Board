import fs from 'fs';
import path from 'path';

const extractTextFromPDF = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const text = fileBuffer.toString('utf-8');
    
    const lines = text.split('\n');
    const cleanedLines = lines
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    return cleanedLines.join('\n');
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
};

const extractTextFromDOCX = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const text = fileBuffer.toString('utf-8');
    
    const lines = text.split('\n');
    const cleanedLines = lines
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    return cleanedLines.join('\n');
  } catch (error) {
    throw new Error('Failed to extract text from DOCX');
  }
};

const extractTextFromDOC = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const text = fileBuffer.toString('utf-8');
    
    const lines = text.split('\n');
    const cleanedLines = lines
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    return cleanedLines.join('\n');
  } catch (error) {
    throw new Error('Failed to extract text from DOC');
  }
};

export const parseFile = async (filePath) => {
  const fileExtension = path.extname(filePath).toLowerCase();
  
  switch (fileExtension) {
    case '.pdf':
      return await extractTextFromPDF(filePath);
    case '.docx':
      return await extractTextFromDOCX(filePath);
    case '.doc':
      return await extractTextFromDOC(filePath);
    default:
      throw new Error('Unsupported file type');
  }
};

export const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
}; 
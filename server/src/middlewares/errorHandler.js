import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 5MB.' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected file field.' 
      });
    }
    return res.status(400).json({ 
      message: 'File upload error', 
      error: err.message 
    });
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      message: err.message 
    });
  }
  
  console.error(err);
  res.status(500).json({ 
    message: 'Internal server error' 
  });
}; 
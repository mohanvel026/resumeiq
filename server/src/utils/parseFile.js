const fs = require('fs')

const parseFile = async (buffer, fileType) => {
  if (fileType === 'pdf') {
    try {
      const pdfParse = require('pdf-parse')
      const data = await pdfParse(buffer)
      if (data.text && data.text.trim().length > 20) {
        console.log('PDF parsed, length:', data.text.trim().length)
        return data.text.trim()
      }
      return 'PDF text extraction returned empty'
    } catch (err) {
      console.error('PDF parse error:', err.message)
      return 'PDF uploaded but text extraction failed'
    }
  }

  if (fileType === 'docx') {
    try {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      if (result.value && result.value.trim().length > 20) {
        return result.value.trim()
      }
      return 'DOCX text extraction returned empty'
    } catch (err) {
      console.error('DOCX parse error:', err.message)
      return 'DOCX uploaded but text extraction failed'
    }
  }

  return 'File uploaded'
}

module.exports = parseFile
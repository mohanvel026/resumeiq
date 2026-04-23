const mammoth = require('mammoth')
const fs = require('fs')

const parseFile = async (filePath, fileType) => {
  if (fileType === 'pdf') {
    try {
      const pdfParse = require('pdf-parse')
      const dataBuffer = fs.readFileSync(filePath)
      const data = await pdfParse(dataBuffer)
      return data.text || 'PDF parsed successfully'
    } catch (err) {
      console.error('PDF parse error:', err.message)
      return 'Resume uploaded - text extraction pending'
    }
  } else if (fileType === 'docx') {
    try {
      const result = await mammoth.extractRawText({ path: filePath })
      return result.value || 'DOCX parsed successfully'
    } catch (err) {
      return 'Resume uploaded - text extraction pending'
    }
  }
  return 'File uploaded successfully'
}

module.exports = parseFile
const fs = require('fs')

const parseFile = async (filePath, fileType) => {
  if (fileType === 'pdf') {
    try {
      const mod = require('pdf-parse')
      const pdfParse = typeof mod === 'function' ? mod : mod.default
      const buffer = fs.readFileSync(filePath)
      const data = await pdfParse(buffer)
      if (data.text && data.text.trim().length > 20) {
        console.log('PDF parsed, length:', data.text.trim().length)
        return data.text.trim()
      }
      return 'PDF text was empty'
    } catch (err) {
      console.error('PDF parse error:', err.message)
      // Try alternative
      try {
        const pdfParse = require('pdf-parse/lib/pdf-parse.js')
        const buffer = fs.readFileSync(filePath)
        const data = await pdfParse(buffer)
        if (data.text && data.text.trim().length > 20) {
          console.log('PDF parsed (alt), length:', data.text.trim().length)
          return data.text.trim()
        }
      } catch (err2) {
        console.error('PDF alt parse error:', err2.message)
      }
      return 'PDF uploaded - text extraction failed'
    }
  }

  if (fileType === 'docx') {
    try {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ path: filePath })
      if (result.value && result.value.trim().length > 20) {
        return result.value.trim()
      }
      return 'DOCX text was empty'
    } catch (err) {
      console.error('DOCX parse error:', err.message)
      return 'DOCX uploaded - text extraction failed'
    }
  }

  return 'File uploaded'
}

module.exports = parseFile
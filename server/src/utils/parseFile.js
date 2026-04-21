const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
const fs = require('fs')

const parseFile = async (filePath, fileType) => {
  if (fileType === 'pdf') {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
  } else if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  }
  throw new Error('Unsupported file type')
}

module.exports = parseFile
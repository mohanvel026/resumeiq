require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  const resume = await prisma.resume.findFirst({
    orderBy: { createdAt: 'desc' }
  })
  
  if (!resume) {
    console.log('No resume found!')
    return
  }
  
  console.log('=== RESUME INFO ===')
  console.log('ID:', resume.id)
  console.log('Title:', resume.title)
  console.log('Text Length:', resume.rawText?.length)
  console.log('')
  console.log('=== RAW TEXT ===')
  console.log(resume.rawText)
  
  await prisma.$disconnect()
}

test().catch(console.error)
const { S3Client, GetObjectCommand, PutObjectCommand, CopyObjectCommand } = require('@aws-sdk/client-s3')
const sharp = require('sharp')

const s3 = new S3Client({})

exports.handler = async function (event) {
  console.log('Received S3 event:', JSON.stringify(event, null, 2))
  const record = event.Records[0]
  const bucket = record.s3.bucket.name
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '))

  try {
    // Only process public uploads and skip generated thumbs or webp loops
    if (!key.startsWith('public/')) return
    if (key.includes('/thumbs/')) return

    // If already webp full exists, generate a thumb from it and exit
    // Otherwise convert to webp for full and also create thumb
    const base = key.replace(/^public\//, '') // e.g., photos/file.jpg
    const dir = base.substring(0, base.lastIndexOf('/') + 1)
    const name = base.substring(base.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '')
    const fullWebpKey = `public/${dir}${name}.webp`
    const thumbKey = `public/${dir}thumbs/${name}.webp`

    // Fetch original
    const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    const body = await streamToBuffer(obj.Body)

    const image = sharp(body).rotate()

    // create full webp max 1600w
    const fullBuffer = await image.clone().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer()
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: fullWebpKey, Body: fullBuffer, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable' }))

    // create thumb 400w
    const thumbBuffer = await image.clone().resize({ width: 400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: thumbKey, Body: thumbBuffer, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable' }))

    console.log('Generated:', fullWebpKey, thumbKey)
  } catch (e) {
    console.error('Processing failed', e)
    throw e
  }
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', (c) => chunks.push(Buffer.from(c)))
    stream.on('error', (e) => reject(e))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}
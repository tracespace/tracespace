'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Aws = require('aws-sdk')
const glob = require('globby')
const mime = require('mime')
const omit = require('lodash/omit')

const {AWS_S3_REGION, AWS_S3_BUCKET} = process.env
const args = process.argv.slice(2)

const USAGE = 'node ./scripts/publish-to-s3.js <local_path:publish_path>...'

const AWS_S3_ACL = 'public-read'
const AWS_S3_DEFAULT_CACHE = ['public', 'max-age=31536000']

assert(
  typeof AWS_S3_REGION === 'string',
  'Expected AWS_S3_REGION to be defined'
)

assert(
  typeof AWS_S3_BUCKET === 'string',
  'Expected AWS_S3_BUCKET to be defined'
)

assert(args.length > 0, USAGE)

const s3 = new Aws.S3({apiVersion: '2006-03-01', region: AWS_S3_REGION})

const publishTargets = args.map(s => {
  const [localDir, publishPath] = s.split(':')
  assert(typeof localDir === 'string' && typeof publishPath === 'string', USAGE)
  return [path.join(process.cwd(), localDir), publishPath]
})

console.log(`Deploying to s3://${AWS_S3_BUCKET}`)

Promise.all([getObjectsToUpload(), getExistingObjects()])
  .then(([uploads, existing]) => {
    assert(uploads.length > 0, 'No files to upload found')
    const removals = getObjectsToRemove(uploads, existing)

    console.log(`Uploading ${uploads.length} objects`)

    return Promise.all(uploads.map(makeUploadRequest)).then(() => {
      console.log(`Uploads successful; removing ${removals.length} old files`)
      return Promise.all(removals.map(makeRemoveRequest))
    })
  })
  .then(() => {
    console.log('Removals successful; publish done')
    process.exit(0)
  })
  .catch(error => {
    console.error('Error during publish', error)
    process.exit(1)
  })

function getObjectsToUpload() {
  const localDirs = publishTargets.map(([local]) => local)
  return glob(localDirs, {absolute: true, dot: true}).then(files =>
    files.map(buildUploadParams)
  )
}

function getExistingObjects() {
  return s3
    .listObjectsV2({Bucket: AWS_S3_BUCKET})
    .promise()
    .then(response =>
      response.Contents.map(f => ({Bucket: AWS_S3_BUCKET, Key: f.Key}))
    )
}

function getObjectsToRemove(uploads, existing) {
  return existing.filter(e => !uploads.some(u => u.Key === e.Key))
}

function makeUploadRequest(params) {
  console.log('Upload:', omit(params, ['Body']))

  return s3.putObject(params).promise()
}

function makeRemoveRequest(params) {
  console.log('Delete:', params)

  return s3.deleteObject(params).promise()
}

function buildUploadParams(filepath) {
  const target = publishTargets.find(([local]) => filepath.startsWith(local))
  assert(target, `Couldn't find directory for ${filepath}`)

  const [uploadDir, publishPath] = target
  const relPath = path.relative(uploadDir, filepath)
  const outPath = path.join(publishPath, relPath)

  return {
    Bucket: AWS_S3_BUCKET,
    ACL: AWS_S3_ACL,
    Key: outPath,
    Body: fs.createReadStream(filepath),
    CacheControl: getCacheControl(filepath),
    ContentType: mime.getType(filepath),
  }
}

function getCacheControl(filepath) {
  // most assets are static with hashed filenames, so long cache is good
  // HTML files are not hash-named, tho, so ensure requests make an e-tag check
  const cacheControl =
    path.extname(filepath) === '.html'
      ? [...AWS_S3_DEFAULT_CACHE, 'no-cache']
      : AWS_S3_DEFAULT_CACHE

  return cacheControl.join(', ')
}

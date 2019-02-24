'use strict'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Aws = require('aws-sdk')
const glob = require('globby')
const mime = require('mime')
const omit = require('lodash/omit')

const {AWS_S3_REGION, AWS_S3_BUCKET} = process.env
const [localPath, publishPath = ''] = process.argv.slice(2)

const USAGE = 'node ./path/to/publish-to-s3.js <local_path> [publish_path]'

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

assert(typeof localPath === 'string', USAGE)

const s3 = new Aws.S3({apiVersion: '2006-03-01', region: AWS_S3_REGION})
const uploadDir = path.resolve(process.cwd(), localPath)

upload()
  .then(() => {
    console.log('Publish successful')
    process.exit(0)
  })
  .catch(error => {
    console.error('Error during publish', error)
    process.exit(1)
  })

function upload() {
  console.log(`uploading ${uploadDir} to s3://${AWS_S3_BUCKET}/${publishPath}`)

  return glob(uploadDir, {absolute: true, dot: true}).then(files =>
    Promise.all(files.map(buildUploadParams).map(makeUploadRequest))
  )
}

function makeUploadRequest(params) {
  console.log('Upload:', omit(params, ['Body']))

  return s3.putObject(params).promise()
}

function buildUploadParams(filepath) {
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

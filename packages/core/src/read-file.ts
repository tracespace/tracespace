export interface FileRead {
  filename: string
  contents: string
}

export async function readFile(file: File | string): Promise<FileRead> {
  return typeof file === 'string' ? readNodeFile(file) : readBrowserFile(file)
}

async function readBrowserFile(file: File): Promise<FileRead> {
  if (typeof File === 'undefined' || typeof FileReader === 'undefined') {
    throw new TypeError(
      `Cannot read "file" object of type ${typeof file} in a non-browser environment`
    )
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', handleLoad, {once: true})
    reader.addEventListener('error', handleError, {once: true})
    reader.readAsText(file)

    function handleLoad() {
      const contents = reader.result as string
      reader.removeEventListener('error', handleError)
      resolve({filename: file.name, contents})
    }

    function handleError() {
      reader.removeEventListener('load', handleLoad)
      reject(reader.error)
    }
  })
}

async function readNodeFile(file: string): Promise<FileRead> {
  const [fs, path] = await Promise.all([
    import('node:fs/promises'),
    import('node:path'),
  ]).catch(() => {
    throw new TypeError(
      'Cannot read a file path string in a non-Node.js environment'
    )
  })

  const filename = path.basename(file)
  const contents = await fs.readFile(file, 'utf8')

  return {filename, contents}
}

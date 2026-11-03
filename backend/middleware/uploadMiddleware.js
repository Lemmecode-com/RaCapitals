import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `logo-${uniqueSuffix}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimeOk = allowedTypes.test(file.mimetype)

  if (extOk && mimeOk) {
    return cb(null, true)
  }
  return cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'))
}

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `cover-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})

export const uploadBlogCover = multer({
  storage: coverStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})

export default upload
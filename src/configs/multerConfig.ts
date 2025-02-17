import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from './awsConfig';

const BUCKET_NAME = 'locovista';

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const timestamp = Date.now();
      cb(null, `${timestamp}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'document/pdf' 
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid File Type!'));
    }
  }
});

export default upload;

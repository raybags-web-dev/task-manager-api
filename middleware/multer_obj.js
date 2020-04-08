const multer_obj = {
   limits: {
      fileSize: 1000000,
      fieldNameSize: 100
   },
   fileFilter(req, file, cb) {
      if (!(file.originalname.endsWith('.jpg')
         || file.originalname.endsWith('.jpeg'))
         || file.originalname.endsWith('.png')) {
         return cb(new Error(`file_format not accepted! Supported formats include: jpg, jpeg and png`))
      }

      cb(undefined, true)
   }
}
module.exports.multer_obj = multer_obj;

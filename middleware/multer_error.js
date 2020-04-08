exports.mult_upload_error = (error, req, res, next) => {
   res.status(400).send({ error: error.message });
}
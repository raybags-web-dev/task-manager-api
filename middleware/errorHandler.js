exports.async_errors = function (handler) {
   return async (req, res, next) => {
      try {
         await handler(req, res);

      } catch (ex) {

         next()

         res.status(500).send({ ex: { Error: ex.message, Message: 'Action could not be completed' } });
         console.log(ex.message)

      }
   }
}
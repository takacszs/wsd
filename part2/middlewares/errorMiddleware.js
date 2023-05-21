const errorMiddleware = async (context, next) => {
    try {
      context.response.status = 404
      await next();
    } catch (e) {
      console.log(e);
    }
  };
  
  export { errorMiddleware };
  
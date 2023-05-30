const log = async (context, next) => {
    console.log(`${context.request.method} ${context.request.url.pathname}`);
    await next();
  };
  
  export { log };
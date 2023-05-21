const time = async ({ response }, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  response.body+=`- ${ms} ms`
};

export { time };
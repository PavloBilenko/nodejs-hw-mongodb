import createError from 'http-errors';

export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    throw createError(400, `Validation error: ${error.details[0].message}`);
  }
  next();
};

import Joi from 'joi';

// Схема для створення нового контакту (POST)
export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': '"name" має бути текстом',
    'string.empty': '"name" не може бути порожнім',
    'string.min': '"name" має бути не менше {#limit} символів',
    'string.max': '"name" має бути не більше {#limit} символів',
    'any.required': '"name" є обов\'язковим полем',
  }),
  phoneNumber: Joi.string().required().messages({
    'string.base': '"phoneNumber" має бути текстом',
    'string.empty': '"phoneNumber" не може бути порожнім',
    'any.required': '"phoneNumber" є обов\'язковим полем',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': '"email" має бути валідним email-адресом',
  }),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .messages({
      'any.only': '"contactType" має бути одним з ["work", "home", "personal"]',
      'any.required': '"contactType" є обов\'язковим полем',
    }),
  isFavourite: Joi.boolean().optional(),
});

// Схема для оновлення контакту (PATCH)
export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).optional().messages({
    'string.min': '"name" має бути не менше {#limit} символів',
    'string.max': '"name" має бути не більше {#limit} символів',
  }),
  phoneNumber: Joi.string().optional().messages({
    'string.base': '"phoneNumber" має бути текстом',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': '"email" має бути валідним email-адресом',
  }),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .optional()
    .messages({
      'any.only': '"contactType" має бути одним з ["work", "home", "personal"]',
    }),
  isFavourite: Joi.boolean().optional(),
}).min(1); // Переконуємося, що хоча б одне поле передано.

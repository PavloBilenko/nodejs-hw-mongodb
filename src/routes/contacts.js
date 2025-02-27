import { Router } from 'express';
import multer from 'multer';
import * as contactsController from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validators/contactValidator.js';

// Налаштування Multer для завантаження файлів
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// Захист усіх роутів за допомогою middleware `authenticate`
router.use(authenticate);

router.get('/', ctrlWrapper(contactsController.getAllContacts));

router.get(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.getContactById),
);

router.post(
  '/',
  upload.single('photo'), // Додаємо підтримку завантаження фото
  validateBody(createContactSchema),
  ctrlWrapper(contactsController.createContact),
);

router.patch(
  '/:contactId',
  isValidId,
  upload.single('photo'), // Додаємо підтримку оновлення фото
  validateBody(updateContactSchema),
  ctrlWrapper(contactsController.updateContact),
);

router.delete(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.deleteContact),
);

export default router;

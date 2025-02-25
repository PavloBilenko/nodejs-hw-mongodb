import { Router } from 'express';
import * as contactsController from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validators/contactValidator.js';

const router = Router();

router.get('/', ctrlWrapper(contactsController.getAllContacts));
router.get(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.getContactById),
);
router.post(
  '/',
  validateBody(createContactSchema),
  ctrlWrapper(contactsController.createContact),
);
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(contactsController.updateContact),
);
router.delete(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsController.deleteContact),
);

export default router;

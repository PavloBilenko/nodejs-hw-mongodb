import { Router } from 'express';
import Contact from '../models/contact.js';
import multer from 'multer';

const upload = multer();
const router = Router();

// Отримати всі контакти
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Створити новий контакт
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber, email, contactType } = req.body;
    if (!name || !phoneNumber || !email || !contactType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newContact = await Contact.create({
      name,
      phoneNumber,
      email,
      contactType,
    });
    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Оновити контакт (PATCH)
router.patch('/:contactId', upload.none(), async (req, res) => {
  try {
    const { contactId } = req.params;
    const updatedData = req.body;

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      updatedData,
      { new: true },
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({
      status: 200,
      message: 'Successfully updated the contact!',
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Видалити контакт (DELETE)
router.delete('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;

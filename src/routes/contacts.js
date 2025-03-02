import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Contact from '../models/contact.js';
import multer from 'multer';

const upload = multer();
const router = Router();

// Отримати всі контакти
router.get('/', async (req, res) => {
  try {
    // Якщо ви додали логіку фільтрації чи сортування, вона йде тут.
    const contacts = await Contact.find();
    if (!contacts || contacts.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No contacts found',
        data: [],
      });
    }
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

// Отримати контакт за id
router.get('/:contactId', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
      });
    }
    res.json({
      status: 200,
      message: `Successfully found contact with id ${req.params.contactId}!`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

// Створити новий контакт (POST) – очікується multipart/form-data
router.post('/', upload.none(), async (req, res) => {
  try {
    const { name, phoneNumber, contactType, email, isFavourite } = req.body;

    // Перевірка обов'язкових полів
    if (!name || !phoneNumber || !contactType) {
      return res.status(400).json({
        status: 400,
        message:
          'Missing required fields: name, phoneNumber, and contactType are required',
      });
    }

    // Отримуємо userId з токена
    let userId;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.decode(token);
      userId = decoded?.userId;
    }
    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: 'Missing userId from token',
      });
    }

    // Створюємо новий контакт
    const newContact = await Contact.create({
      name,
      phoneNumber,
      contactType,
      email,
      isFavourite,
      userId,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

// Оновити контакт (PATCH) – очікується multipart/form-data
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
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
      });
    }

    res.json({
      status: 200,
      message: 'Successfully updated the contact!',
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

// Видалити контакт (DELETE)
router.delete('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return res.status(404).json({
        status: 404,
        message: 'Contact not found',
      });
    }

    // 204 статус – без тіла відповіді
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

export default router;

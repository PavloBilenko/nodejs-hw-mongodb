import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Contact from '../models/contact.js';
import multer from 'multer';

const upload = multer();
const router = Router();

// Отримати всі контакти з підтримкою фільтрації, сортування та пагінації
router.get('/', async (req, res) => {
  try {
    const { page, perPage, sortBy, sortOrder, type, isFavourite } = req.query;
    const filter = {};

    // Якщо задано фільтрацію за типом контакту
    if (type) {
      filter.contactType = type;
    }
    // Якщо задано фільтрацію за isFavourite
    if (typeof isFavourite !== 'undefined') {
      filter.isFavourite = isFavourite === 'true';
    }

    let query = Contact.find(filter);

    // Сортування: якщо вказано sortBy, використовуємо sortOrder (за замовчуванням asc)
    if (sortBy) {
      const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? -1 : 1;
      query = query.sort({ [sortBy]: order });
    }

    // Пагінація: якщо передано page та perPage
    if (page && perPage) {
      const p = parseInt(page);
      const pp = parseInt(perPage);
      query = query.skip((p - 1) * pp).limit(pp);
    }

    const contacts = await query;
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

// Створити новий контакт
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber, email, contactType } = req.body;
    if (!name || !phoneNumber) {
      return res.status(400).json({
        status: 400,
        message: 'Missing required fields: name and phoneNumber are required',
      });
    }
    // Отримуємо userId з токена з заголовка Authorization
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
    const newContact = await Contact.create({
      name,
      phoneNumber,
      email,
      contactType,
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
      {
        new: true,
      },
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
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
});

export default router;

import { Router } from 'express';
import Contact from '../models/contact.js';

const router = Router();

// GET /contacts - Отримати всі контакти
router.get('/api/contacts', async (req, res) => {
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

// GET /contacts/:contactId - Отримати контакт за ID
router.get('/:contactId', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({
      status: 200,
      message: `Successfully found contact with id ${req.params.contactId}!`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST /contacts - Створити новий контакт
router.post('/', async (req, res) => {
  try {
    const newContact = await Contact.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully created contact!',
      data: newContact,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Failed to create contact', error: error.message });
  }
});

// PATCH /contacts/:contactId - Оновити контакт за ID
router.patch('/:contactId', async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.contactId,
      req.body,
      { new: true },
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({
      status: 200,
      message: `Successfully updated contact with id ${req.params.contactId}!`,
      data: updatedContact,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Failed to update contact', error: error.message });
  }
});

// DELETE /contacts/:contactId - Видалити контакт за ID
router.delete('/:contactId', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(
      req.params.contactId,
    );
    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({
      status: 200,
      message: `Successfully deleted contact with id ${req.params.contactId}!`,
      data: deletedContact,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to delete contact', error: error.message });
  }
});

export default router;

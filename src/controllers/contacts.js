import Contact from '../models/contact.js';
import mongoose from 'mongoose';
import createError from 'http-errors';

// Отримати всі контакти
export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    next(createError(500, 'Failed to retrieve contacts'));
  }
};

// Отримати контакт за ID
export const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    // Перевірка валідності ObjectId
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(createError(400, 'Invalid contact ID format'));
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return next(createError(404, 'Contact not found'));
    }

    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// Створити новий контакт
export const createContact = async (req, res, next) => {
  try {
    const { name, phoneNumber, contactType } = req.body;
    if (!name || !phoneNumber || !contactType) {
      throw createError(
        400,
        'Missing required fields: name, phoneNumber, contactType',
      );
    }

    const newContact = await Contact.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully created contact!',
      data: newContact,
    });
  } catch (error) {
    next(createError(400, `Failed to create contact: ${error.message}`));
  }
};

// Оновити контакт за ID
export const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(createError(400, 'Invalid contact ID format'));
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      req.body,
      { new: true },
    );
    if (!updatedContact) {
      return next(createError(404, 'Contact not found'));
    }

    res.json({
      status: 200,
      message: `Successfully updated contact with id ${contactId}!`,
      data: updatedContact,
    });
  } catch (error) {
    next(createError(400, `Failed to update contact: ${error.message}`));
  }
};

// Видалити контакт за ID
export const deleteContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(createError(400, 'Invalid contact ID format'));
    }

    const deletedContact = await Contact.findByIdAndDelete(contactId);
    if (!deletedContact) {
      return next(createError(404, 'Contact not found'));
    }

    res.status(200).json({
      status: 200,
      message: `Successfully deleted contact with id ${contactId}!`,
      data: deletedContact,
    });
  } catch (error) {
    next(createError(500, `Failed to delete contact: ${error.message}`));
  }
};

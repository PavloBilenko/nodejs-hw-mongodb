import Contact from '../models/contact.js';
import mongoose from 'mongoose';
import createError from 'http-errors';

// Отримати всі контакти
export const getAllContacts = async (req, res) => {
  const contacts = await Contact.find();

  if (!contacts.length) {
    throw createError(404, 'No contacts found');
  }

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

// Отримати контакт за ID
export const getContactById = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, 'Invalid contact ID format');
  }

  const contact = await Contact.findById(contactId);
  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

// Створити новий контакт
export const createContact = async (req, res) => {
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
};

// Оновити контакт за ID
export const updateContact = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, 'Invalid contact ID format');
  }

  const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully updated contact with id ${contactId}!`,
    data: updatedContact,
  });
};

// Видалити контакт за ID
export const deleteContact = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, 'Invalid contact ID format');
  }

  const deletedContact = await Contact.findByIdAndDelete(contactId);
  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully deleted contact with id ${contactId}!`,
    data: deletedContact,
  });
};

import Contact from '../models/contact.js';
import mongoose from 'mongoose';
import createError from 'http-errors';
import cloudinary from 'cloudinary';

// Налаштування Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Отримати всі контакти
export const getAllContacts = async (req, res) => {
  if (!req.user || !req.user._id) {
    throw createError(401, 'User not authenticated');
  }

  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const skip = (page - 1) * perPage;
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  // Фільтрація за userId
  const filter = { userId: req.user._id };
  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';

  const totalItems = await Contact.countDocuments(filter);
  const contacts = await Contact.find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(parseInt(perPage));

  const totalPages = Math.ceil(totalItems / perPage);

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page: parseInt(page),
      perPage: parseInt(perPage),
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
};

// Отримати контакт за ID
export const getContactById = async (req, res) => {
  if (!req.user || !req.user._id) {
    throw createError(401, 'User not authenticated');
  }

  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, 'Invalid contact ID format');
  }

  const contact = await Contact.findOne({
    _id: contactId,
    userId: req.user._id,
  });

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
  if (!req.user || !req.user._id) {
    throw createError(401, 'User not authenticated');
  }

  const { name, phoneNumber, contactType, email, isFavourite } = req.body;

  if (!name || !phoneNumber || !contactType) {
    throw createError(
      400,
      'Missing required fields: name, phoneNumber, contactType',
    );
  }

  let photoUrl = '';

  if (req.file) {
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: 'contacts' },
        (error, result) => {
          if (error) reject(createError(500, 'Failed to upload image'));
          else resolve(result.secure_url);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    photoUrl = uploadResponse;
  }

  const newContact = await Contact.create({
    name,
    phoneNumber,
    contactType,
    email: email || '',
    isFavourite: isFavourite || false,
    userId: req.user._id,
    photo: photoUrl,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created contact!',
    data: newContact,
  });
};

// Оновити контакт за ID
export const updateContact = async (req, res) => {
  if (!req.user || !req.user._id) {
    throw createError(401, 'User not authenticated');
  }

  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, 'Invalid contact ID format');
  }

  if (Object.keys(req.body).length === 0 && !req.file) {
    throw createError(400, 'No fields provided for update');
  }

  const { contactType } = req.body;
  if (contactType && !['work', 'home', 'personal'].includes(contactType)) {
    throw createError(
      400,
      'Invalid contactType. Allowed values: work, home, personal',
    );
  }

  let photoUrl = '';

  if (req.file) {
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { folder: 'contacts' },
        (error, result) => {
          if (error) reject(createError(500, 'Failed to upload image'));
          else resolve(result.secure_url);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    photoUrl = uploadResponse;
  }

  const updatedData = { ...req.body };
  if (photoUrl) {
    updatedData.photo = photoUrl;
  }

  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, userId: req.user._id },
    updatedData,
    { new: true },
  );

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
  if (!req.user || !req.user._id) {
    throw createError(401, 'User not authenticated');
  }

  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, 'Invalid contact ID format');
  }

  const deletedContact = await Contact.findOneAndDelete({
    _id: contactId,
    userId: req.user._id,
  });

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  // Видалити фото з Cloudinary, якщо є
  if (deletedContact.photo) {
    const publicId = deletedContact.photo.split('/').pop().split('.')[0];
    await cloudinary.v2.uploader.destroy(publicId);
  }

  res.status(204).send();
};

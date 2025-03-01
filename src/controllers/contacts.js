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
export const getAllContacts = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next(createError(401, 'User not authenticated'));
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

    const filter = { userId: req.user._id };
    if (type) filter.contactType = type;
    if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';

    const totalItems = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parseInt(perPage));

    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        contacts,
        page: parseInt(page),
        perPage: parseInt(perPage),
        totalItems,
        totalPages: Math.ceil(totalItems / perPage),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Отримати контакт за ID
export const getContactById = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next(createError(401, 'User not authenticated'));
    }

    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(createError(400, 'Invalid contact ID format'));
    }

    const contact = await Contact.findOne({
      _id: contactId,
      userId: req.user._id,
    });

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
  console.log('🔹 Received body:', JSON.stringify(req.body, null, 2)); // ВИВЕДЕМО ТІЛО ЗАПИТУ
  console.log('🔹 Headers:', req.headers); // ДЛЯ ПЕРЕВІРКИ CONTENT-TYPE
  console.log('Received body:', req.body);
  console.log('Authenticated user:', req.user);

  if (!req.user || !req.user._id) {
    return next(createError(401, 'User not authenticated'));
  }

  const { name, phoneNumber, contactType, email, isFavourite } = req.body;

  if (!name || !phoneNumber || !contactType) {
    return next(
      createError(
        400,
        'Missing required fields: name, phoneNumber, contactType',
      ),
    );
  }
  console.log('Validating:', { name, phoneNumber, contactType });

  try {
    const newContact = await Contact.create({
      name,
      phoneNumber,
      contactType,
      email: email || '',
      isFavourite: isFavourite || false,
      userId: req.user._id,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully created contact!',
      data: newContact,
    });
  } catch (error) {
    console.error('❌ Error in createContact:', error); // ДОДАТКОВИЙ ЛОГ ДЛЯ ПОМИЛКИ
    next(error);
  }
};

// Оновити контакт
export const updateContact = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next(createError(401, 'User not authenticated'));
    }

    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(createError(400, 'Invalid contact ID format'));
    }

    let updatedData = { ...req.body };

    if (req.file) {
      try {
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

        updatedData.photo = uploadResponse;
      } catch (error) {
        return next(createError(500, 'Failed to upload image'));
      }
    }

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId: req.user._id },
      updatedData,
      { new: true },
    );

    if (!updatedContact) {
      return next(createError(404, 'Contact not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully updated contact!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

// Видалити контакт
export const deleteContact = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next(createError(401, 'User not authenticated'));
    }

    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(createError(400, 'Invalid contact ID format'));
    }

    const deletedContact = await Contact.findOneAndDelete({
      _id: contactId,
      userId: req.user._id,
    });

    if (!deletedContact) {
      return next(createError(404, 'Contact not found'));
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

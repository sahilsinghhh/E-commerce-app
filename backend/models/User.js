import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      default: 'Home',
      maxlength: 40,
    },
    fullName: {
      type: String,
      trim: true,
      required: [true, 'Please provide a recipient name'],
      maxlength: 80,
    },
    phone: {
      type: String,
      trim: true,
      required: [true, 'Please provide a phone number'],
      maxlength: 24,
    },
    address: {
      type: String,
      trim: true,
      required: [true, 'Please provide a street address'],
      maxlength: 180,
    },
    city: {
      type: String,
      trim: true,
      required: [true, 'Please provide a city'],
      maxlength: 80,
    },
    postalCode: {
      type: String,
      trim: true,
      required: [true, 'Please provide a postal code'],
      maxlength: 24,
    },
    country: {
      type: String,
      trim: true,
      required: [true, 'Please provide a country'],
      maxlength: 80,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    refreshToken: {
      type: String,
      select: false,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export default mongoose.model('User', userSchema);

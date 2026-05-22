import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product stock'],
      default: 0,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/300',
    },
    images: {
      type: [imageSchema],
      validate: {
        validator(images) {
          return images.length <= 5;
        },
        message: 'A product can have at most 5 images',
      },
      default: [],
    },
  },
  { timestamps: true }
);

productSchema.pre('validate', function (next) {
  if (this.images?.length) {
    const primaryIndex = this.images.findIndex((image) => image.isPrimary);
    const selectedPrimaryIndex = primaryIndex >= 0 ? primaryIndex : 0;

    this.images.forEach((image, index) => {
      image.isPrimary = index === selectedPrimaryIndex;
      if (!image.alt) image.alt = this.name;
    });

    this.image = this.images[selectedPrimaryIndex].url;
  }

  next();
});

productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);

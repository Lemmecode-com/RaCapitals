import mongoose from 'mongoose'

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Article slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true,
      default: ''
    },
    contentHtml: {
      type: String,
      required: [true, 'Article content is required']
    },
    excerpt: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Valuation & Analysis',
        'Guides & Education',
        'Pre-IPO News',
        'Tax & Legal'
      ],
      default: 'Valuation & Analysis'
    },
    readTime: {
      type: String,
      default: '5 min read'
    },
    publishedDate: {
      type: Date,
      default: Date.now
    },
    author: {
      type: String,
      default: 'RA Research Desk'
    },
    authorRole: {
      type: String,
      default: 'Equity & Private Markets Analyst'
    },
    coverImage: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    relatedSlugs: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
)

// Indexes for high performance querying & SEO
BlogSchema.index({ status: 1, publishedDate: -1 })
BlogSchema.index({ category: 1, status: 1 })
BlogSchema.index({ featured: 1, status: 1 })

export default mongoose.model('Blog', BlogSchema)

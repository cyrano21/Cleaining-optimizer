import { Schema, models, model } from 'mongoose'

const sectionSchema = new Schema({
  title: String,
  content: String,
})

const cvSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  template: String,
  personalInfo: {
    firstName: String,
    lastName: String,
    title: String,
    email: String,
    phone: String,
  },
  sections: [sectionSchema],
}, { timestamps: true })

export default models.CV || model('CV', cvSchema)

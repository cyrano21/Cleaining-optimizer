// app/modules/user-model.ts
import { Schema, models, model } from 'mongoose'

const userSchema = new Schema({
  email:              { type: String, required: true, unique: true },
  name:               String,
  stripeCustomerId:   String,
  stripeSubscriptionId:String,
  subscriptionStatus: { type: String, default: 'inactive' },
  role:               { type: String, default: 'FREE' },
  plan:               { type: String, default: 'free' },
  createdAt:          { type: Date,   default: Date.now },
})

export default models.User || model('User', userSchema)

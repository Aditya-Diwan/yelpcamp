import Stripe from 'stripe'
import { buffer } from 'micro'
import User from '../../models/User'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function webhookHandler(req, res) {
  const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY)

  if (req.method === 'POST') {
    const buf = await buffer(req)
    const sign = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event

    try {
      if (!sign || !webhookSecret) return

      event = stripe.webhooks.constructEvent(buf, sign, webhookSecret)
    } catch (e) {
      console.log(`Webhook error: ${e.message}`)
      return res.status(400).send(`Webhook error: ${e.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      const { email } = event.data.object.metadata
      await User.findOneAndUpdate(
        { email },
        {
          premium: { subscribed: true },
        }
      )
    } else if (event.type === 'customer.subscription.created') {
      const {
        user: userId,
        checkIn,
        checkOut,
        camp,
      } = event.data.object.metadata

      const trip = { checkIn, checkOut, camp }

      await User.findByIdAndUpdate(userId, {
        $push: { trips: trip },
      })
    }
    res.status(200).send()
  }
}

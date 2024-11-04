import dotenv from 'dotenv'
import express from 'express'
const app = express()
import { connectToDatabase } from './lib/mongoose.js'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses' // use asw sdk v3 rather than v2
import { createEmailContent } from './email_content.js'
import { UserProfile, EateryProfile } from './models/profile.js'
dotenv.config()
connectToDatabase()
const client = new SESClient({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRET_ACCESSKEY,
  },
})

const devTeam = ['Your email']

const eateries = [
  {
    _id: '66211006d29e19e6d331b5a6',
    userId: '66211006d29e19e6d331b5a2',
    username: 'bb seafood',
    opening_hours: ['2024-04-18T00:00:05.152Z', '2024-04-18T10:30:15.159Z'],
    is_public: true,
    is_subscribed: true,
    cuisine: ['Seafood', 'Indian'],
    rating_average: 5,
    rating_quantity: 1,
    avatar: 'data:image/jpeg;base64,/9j/4AA..',
    address: '234 Sussex St, Sydney NSW 2000, Australia',
    geo_coordinates: {
      type: 'Point',
      coordinates: [151.2043704, -33.8722917],
    },
  },
  {
    _id: '66211006d29e19e6d331b5a6',
    userId: '66211006d29e19e6d331b5a2',
    username: 'bb seafood',
    opening_hours: ['2024-04-18T00:00:05.152Z', '2024-04-18T10:30:15.159Z'],
    is_public: true,
    is_subscribed: true,
    cuisine: ['Seafood', 'Indian'],
    rating_average: 5,
    rating_quantity: 1,
    avatar: 'data:image/jpeg;base64,/9j/4AA..',
    address: '234 Sussex St, Sydney NSW 2000, Australia',
    geo_coordinates: {
      type: 'Point',
      coordinates: [151.2043704, -33.8722917],
    },
  },
]
const username = 'Helen'

const params = {
  Source: 'YumYum',
  Destination: {
    ToAddresses: devTeam,
  },
  Message: {
    Subject: {
      Data: 'Yum Yum',
    },
    Body: {
      Html: {
        Data: createEmailContent(eateries, username),
      },
    },
  },
}

async function fetchAndSendEmail(username, targets) {
  try {
    let result = await EateryProfile.aggregate([
      { $match: { is_public: true, geo_coordinates: { $exists: true } } },
      { $sample: { size: 3 } },
    ])
    result = result.map((eatery) => ({
      ...eatery,
      url: `YOUR_DOMAIN/eateryDetails/${eatery.userId}`,
    }))
    let params = {
      Source: 'your email',
      Destination: {
        ToAddresses: targets,
      },
      Message: {
        Subject: {
          Data: 'Yum Yum',
        },
        Body: {
          Html: {
            Data: createEmailContent(result, username),
          },
        },
      },
    }
    console.log(createEmailContent(result, username))
    sendEmail(params)
  } catch (error) {
    console.error(error)
  }
}

async function sendEmail(params) {
  try {
    // get reommend data
    const command = new SendEmailCommand(params)
    const data = await client.send(command)
  } catch (err) {
    console.error('Error', err)
  }
}

export default fetchAndSendEmail

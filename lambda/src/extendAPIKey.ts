import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger'
import middy from '@middy/core'
import { AppSyncClient, UpdateApiKeyCommand } from '@aws-sdk/client-appsync'

const region = process.env.AWS_REGION
const apiId = process.env.API_ID
const id = process.env.ID

const client = new AppSyncClient({ region })
const logger = new Logger()

const expires =
  new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getTime() /
  1000

export const lambdaHandler = async () => {
  try {
    await client.send(new UpdateApiKeyCommand({ apiId, id, expires }))
    logger.info('API Key extended.')
  } catch (error) {
    logger.error(error)
  }
}

export const handler = middy(lambdaHandler).use(injectLambdaContext(logger))

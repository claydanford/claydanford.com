import { Construct } from 'constructs'
import * as appsync from '@aws-cdk/aws-appsync-alpha'
import {
  aws_dynamodb as dynamodb,
  aws_lambda as lambda,
  aws_events as events,
  aws_events_targets as targets,
  aws_iam as iam
} from 'aws-cdk-lib'
import * as path from 'path'
import { APIProps } from '../types'

export class API extends Construct {
  constructor(scope: Construct, id: string, props: APIProps) {
    super(scope, id)

    const { region, account } = props

    const api = new appsync.GraphqlApi(this, 'API', {
      name: 'ClayDanfordDotCom',
      schema: appsync.Schema.fromAsset(
        path.join(__dirname, '../../api/schema.graphql')
      )
    })

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    })

    const dataSource = api.addDynamoDbDataSource('DataSource', table)

    dataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateCount',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        path.join(__dirname, '../../api/updateCount.request.vtl')
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        path.join(__dirname, '../../api/updateCount.response.vtl')
      )
    })

    const fn = new lambda.Function(this, 'Lambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'dist/extendAPIKey.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      environment: {
        API_ID: api.apiId,
        ID: api.apiKey!
      }
    })

    fn.role?.attachInlinePolicy(
      new iam.Policy(this, 'UpdateAPIKey', {
        statements: [
          new iam.PolicyStatement({
            actions: ['appsync:UpdateApiKey'],
            resources: [
              `arn:aws:appsync:${region}:${account}:/v1/apis/${api.apiId}/apikeys/${api.apiKey}`
            ]
          })
        ]
      })
    )

    const eventRule = new events.Rule(this, 'scheduleRule', {
      schedule: events.Schedule.cron({ day: '1', hour: '1', minute: '0' })
    })

    eventRule.addTarget(new targets.LambdaFunction(fn))
  }
}

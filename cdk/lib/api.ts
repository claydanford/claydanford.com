import { Construct } from 'constructs'
import * as appsync from '@aws-cdk/aws-appsync-alpha'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as path from 'path'

export interface APIProps {}

export class API extends Construct {
  constructor(scope: Construct, id: string, props?: APIProps) {
    super(scope, id)

    const api = new appsync.GraphqlApi(this, 'API', {
      name: 'ClayDanfordDotCom',
      schema: appsync.Schema.fromAsset(
        path.join(__dirname, '../../api/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY
        }
      }
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

    dataSource.createResolver({
      typeName: 'Query',
      fieldName: 'getCount',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        path.join(__dirname, '../../api/getCount.request.vtl')
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        path.join(__dirname, '../../api/getCount.response.vtl')
      )
    })

    // TODO Custom Domain: https://github.com/aws/aws-cdk/issues/18040
  }
}

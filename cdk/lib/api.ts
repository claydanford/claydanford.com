import { Construct } from 'constructs'
import * as appsync from '@aws-cdk/aws-appsync-alpha'
import {
  aws_appsync as appsyncDomainName,
  Expiration,
  Duration
} from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as path from 'path'

export interface APIProps {
  domainName: string
  zone: route53.IHostedZone
  certificateArn: string
}

export class API extends Construct {
  constructor(scope: Construct, id: string, props: APIProps) {
    super(scope, id)

    const { domainName, certificateArn, zone } = props

    const api = new appsync.GraphqlApi(this, 'API', {
      name: 'ClayDanfordDotCom',
      schema: appsync.Schema.fromAsset(
        path.join(__dirname, '../../api/schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365))
          }
        }
      }
    })

    const ApiDomainName = new appsyncDomainName.CfnDomainName(
      this,
      'CfnDomainName',
      {
        certificateArn,
        domainName: `api.${domainName}`
      }
    )

    const ApiAssociation = new appsyncDomainName.CfnDomainNameApiAssociation(
      this,
      'CfnDomainNameApiAssociation',
      { domainName: ApiDomainName.domainName, apiId: api.apiId }
    )

    // new route53.CnameRecord(this, 'APICname', {
    //   zone,
    //   domainName,
    //   recordName: 'api.claydanford.com',
    // })

    // new route53.RecordSet(this, 'APIRecord', {})

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
  }
}

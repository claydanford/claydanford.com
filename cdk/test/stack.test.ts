import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import * as TestStack from '../lib/stack'

test('Stack Resources Created', () => {
  const app = new cdk.App()
  // WHEN
  const stack = new TestStack.ClayDanfordDotCom(app, 'MyTestStack', {
    env: { region: 'us-local-1', account: '12345' }
  })
  // THEN
  const template = Template.fromStack(stack)

  template.resourceCountIs('AWS::Route53::HostedZone', 1)
  template.resourceCountIs('AWS::CertificateManager::Certificate', 1)
  template.resourceCountIs('AWS::S3::Bucket', 1)
  template.resourceCountIs('AWS::S3::BucketPolicy', 1)
  template.resourceCountIs('AWS::CloudFront::CloudFrontOriginAccessIdentity', 1)
  template.resourceCountIs('AWS::CloudFront::Distribution', 1)
  template.resourceCountIs('AWS::Route53::RecordSet', 2)
  template.resourceCountIs('AWS::SSM::Parameter', 2)
  template.resourceCountIs('AWS::AppSync::GraphQLApi', 1)
  template.resourceCountIs('AWS::AppSync::GraphQLSchema', 1)
  template.resourceCountIs('AWS::AppSync::ApiKey', 1)
  template.resourceCountIs('AWS::IAM::Role', 2)
  template.resourceCountIs('AWS::IAM::Policy', 2)
  template.resourceCountIs('AWS::AppSync::DataSource', 1)
  template.resourceCountIs('AWS::AppSync::Resolver', 1)
  template.resourceCountIs('AWS::DynamoDB::Table', 1)
})

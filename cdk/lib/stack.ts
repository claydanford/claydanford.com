import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as ssm from 'aws-cdk-lib/aws-ssm'

const domainName = 'claydanford.com'
const ssmPrefix = `/${domainName}/prod`
const records = [
  { id: 'ApexAliasRecord', recordName: domainName },
  { id: 'WWWAliasRecord', recordName: `www.${domainName}` }
]

export class ClayDanfordDotCom extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: domainName
    })

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [`*.${domainName}`],
      validation: acm.CertificateValidation.fromDns(hostedZone)
    })

    const bucket = new s3.Bucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    })

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      certificate,
      defaultRootObject: 'index.html',
      domainNames: records.map((record) => record.recordName),
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
    })

    records.forEach((record) => {
      const { id, recordName } = record
      new route53.ARecord(this, id, {
        recordName,
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        )
      })
    })

    const params = [
      {
        id: 'BucketParam',
        stringValue: bucket.bucketName,
        parameterName: `${ssmPrefix}/bucket`
      },
      {
        id: 'DistributionParam',
        stringValue: distribution.distributionId,
        parameterName: `${ssmPrefix}/distribution`
      }
    ]

    params.forEach((param) => {
      const { id, stringValue, parameterName } = param
      new ssm.StringParameter(this, id, { stringValue, parameterName })
    })
  }
}

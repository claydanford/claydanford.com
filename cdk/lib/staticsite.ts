import { Construct } from 'constructs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export interface StaticSiteProps {
  domainName: string,
  zone: route53.IHostedZone,
  certificate: acm.ICertificate
}

export class StaticSite extends Construct {
  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id)

    const { domainName, zone, certificate } = props

    const records = [
      { id: 'ApexAliasRecord', recordName: domainName },
      { id: 'WWWAliasRecord', recordName: `www.${domainName}` }
    ]

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
        zone,
        recordName,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        )
      })
    })

    const ssmPrefix = `/${domainName}/prod`

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

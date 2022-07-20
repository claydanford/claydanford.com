import { Construct } from 'constructs'
import {
  aws_certificatemanager as acm,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_route53 as route53,
  aws_route53_targets as targets,
  aws_s3 as s3,
  aws_ssm as ssm
} from 'aws-cdk-lib'
import { StaticSiteProps } from '../types'

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

    new ssm.StringParameter(this, 'BucketParam', {
      stringValue: bucket.bucketName,
      parameterName: `${ssmPrefix}/bucket`
    })

    new ssm.StringParameter(this, 'DistributionParam', {
      stringValue: distribution.distributionId,
      parameterName: `${ssmPrefix}/distribution`
    })
  }
}

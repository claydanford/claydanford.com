import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import { StaticSite } from './staticsite'
import { API } from './api'

const domainName = 'claydanford.com'

export class ClayDanfordDotCom extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const zone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: domainName
    })

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [`*.${domainName}`],
      validation: acm.CertificateValidation.fromDns(zone)
    })

    new StaticSite(this, 'StaticSite', { domainName, zone, certificate })

    new API(this, 'API')
  }
}

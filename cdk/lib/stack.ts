import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

export class ClayDanfordDotCom extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const zone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: 'claydanford.com'
    })

    new acm.Certificate(this, 'Certificate', {
      domainName: 'claydanford.com',
      validation: acm.CertificateValidation.fromDns(zone),
      subjectAlternativeNames: ['*.claydanford.com', 'www.claydanford.com']
    })
  }
}

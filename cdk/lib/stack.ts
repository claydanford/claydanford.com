import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
  aws_certificatemanager as acm,
  aws_route53 as route53
} from 'aws-cdk-lib'
import { StaticSite } from './staticsite'
import { API } from './api'
import { ClayDanfordDotComStackProps } from '../types'

const domainName = 'claydanford.com'

export class ClayDanfordDotCom extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ClayDanfordDotComStackProps
  ) {
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

    new API(this, 'API', props.env)
  }
}

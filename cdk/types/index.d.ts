import {
  aws_certificatemanager as acm,
  aws_route53 as route53
} from 'aws-cdk-lib'

export interface StaticSiteProps {
  domainName: string
  zone: route53.IHostedZone
  certificate: acm.ICertificate
}

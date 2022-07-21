import {
  aws_certificatemanager as acm,
  aws_route53 as route53,
  StackProps
} from 'aws-cdk-lib'

export interface ClayDanfordDotComStackProps extends StackProps {
  env: APIProps
}

export interface StaticSiteProps {
  domainName: string
  zone: route53.IHostedZone
  certificate: acm.ICertificate
}

export interface APIProps {
  region: string
  account: string
}

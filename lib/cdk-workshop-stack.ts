import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import { HitCounter } from './hitcounter'

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'), // code loaded from lambda directory
      handler: 'hello.handler' // file is hello, function is handler
    })

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    })

     // defines an API Gateway REST API resource backed by our "hit counter" function.
     new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
     })
  }
}

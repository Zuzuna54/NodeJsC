import * as cdk from 'aws-cdk-lib';
import { Bucket, CfnBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

class l3Bucket extends Construct {
    constructor(scope: Construct, id: string, expiration: number, name: string = 'Myl3Bucket') {
        super(scope, id);

        new Bucket(this, name, {
            lifecycleRules: [{
                expiration: Duration.days(expiration)
            }]
        });
    }
}


export class CdkStarterStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //Create parameter
        const duration = new cdk.CfnParameter(this, 'Duration', {
            type: 'Number',
            default: 6,
            minValue: 1,
            maxValue: 10
        });

        // Create a s3 bucket 
        const Myl2Bucket = new Bucket(this, 'Myl2Bucket', {
            lifecycleRules: [{
                expiration: Duration.days(duration.valueAsNumber)
            }]
        });

        // Create a s3 bucket using CfnBucket
        new CfnBucket(this, 'Myl1Bucket', {
            lifecycleConfiguration: {
                rules: [{
                    expirationInDays: 1,
                    status: 'Enabled'
                }]
            }
        });

        // Create a l3 bucket
        new l3Bucket(this, 'Myl3Bucket', 3, 'L3Bucket');

        // Create a output
        new cdk.CfnOutput(this, 'BucketName', {
            value: Myl2Bucket.bucketName
        });

    }
}

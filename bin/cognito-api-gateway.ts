#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoApiGatewayStack } from '../lib/cognito-api-gateway-stack';

const app = new cdk.App();
new CognitoApiGatewayStack(app, 'CognitoApiGatewayStack');
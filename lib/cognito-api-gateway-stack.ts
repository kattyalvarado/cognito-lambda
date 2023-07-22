import { LambdaRestApi, CfnAuthorizer, LambdaIntegration, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import { AssetCode, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { App, Stack } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito'


export class CognitoApiGatewayStack extends Stack  {
  constructor(app: App, id: string) {
    super(app, id);

    
    // Función que regresa codigo de respuesta 201 con "Hello world!"
    const helloWorldFunction = new Function(this, 'helloWorldFunction', {
      code: new AssetCode('lambda'),
      handler: 'helloworld.handler',
      runtime: Runtime.NODEJS_18_X
    });

    // Rest API para la funcion helloWorldFunction
    const helloWorldLambdaRestApi = new LambdaRestApi(this, 'helloWorldLambdaRestApi', {
      restApiName: 'Hello World API',
      handler: helloWorldFunction,
      proxy: false,
    });

    // Cognito User Pool con Email Sign-in Type.
    const userPool = new UserPool(this, 'userPool', {
      signInAliases: {
        email: true
      }
    });

    // Authorizer para el Hello World API that utiliza el
    // Cognito User pool para autorizar usuarios.
    const authorizer = new CfnAuthorizer(this, 'cfnAuth', {
      restApiId: helloWorldLambdaRestApi.restApiId,
      name: 'HelloWorldAPIAuthorizer',
      type: 'COGNITO_USER_POOLS',
      identitySource: 'method.request.header.Authorization',
      providerArns: [userPool.userPoolArn],
    });

    // Hello Recurso API para la REST API. 
    const hello = helloWorldLambdaRestApi.root.addResource('HELLO');

    // GET method para la HELLO API resource. Esto usa Cognito para
    // autorización and the autorizador definido abajo.
    hello.addMethod('GET', new LambdaIntegration(helloWorldFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: authorizer.ref
      }
    })
  }
}


const app = new App();
new CognitoApiGatewayStack(app, 'CognitoApiGatewayStack');
app.synth();
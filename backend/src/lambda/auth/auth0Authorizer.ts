import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

//import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const cert = '-----BEGIN CERTIFICATE-----'+
'MIIDBzCCAe+gAwIBAgIJKZka2X8JEJYKMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV'+
'BAMTFmRldi05aGRkbThoZy5hdXRoMC5jb20wHhcNMjAwNDE0MjAzMjM2WhcNMzMx'+
'MjIyMjAzMjM2WjAhMR8wHQYDVQQDExZkZXYtOWhkZG04aGcuYXV0aDAuY29tMIIB'+
'IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvFkPgr4cDEvOplCpQVrPOcot'+
'LtYlTlwP33XZa0D2+ksBem1/nPLGzzmUap3vAQOxNPw7Z+2WdAM55EXgAmbk+sW8'+
'pO9bM6jQfBtMro9zw2ZAdDiEKQGIp9YMn8vrhVYEMJIjNVNc+84BR9T++5CgFD+T'+
'PDve8o8rNoTLKybdjT4IV8Qesa8IkJmi58tDhawLOOIL2i213RIifOSIn1ng15dR'+
'IMkVLXZK+kk25Xl6yZRIVx/nXFQgIazh0IqOgL4sRNR6DB2Sh57xNS+eiuWvHWxa'+
'wNK4/cmE4g7pwdaYqlFKjub637faqJrRxma47wv8pdMwv56zIsSkbGF3ReB9IQID'+
'AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSJJeLzguMYL8mxs0Ax'+
'jrxBAwSQ6jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAINuj2f6'+
'Sdew+glYugb45qnujsO4DWXG1M67wjtF1SAWbh9ShXtCxNa0ciHNvtsOcWuqCwZf'+
'DReng2tym7CGzeE9LCoZ0HntzmbPMecpKrQJoBSc94AQB4OWpuUXkOfnL0/b40DW'+
'Q/A+V3aEij+DxPccUAcHTlCJpoqoF9xYuYvB3EM0evEdcSOhhi2RTHLYfOPg1TDn'+
'3M4hXT7ilgXYUHdnXoMLgfMCm6Hl/T5ibVIxRfpr0TaILrd4BzMQ75On0D6d0iYr'+
'hAjrRyvQPrP4GaZYzr07rQVI3rKxvZpMqgd+ql1qQNAG4NfyNoso3vhpCNxB06fY'+
'FW+QK9FA2T5UrxU='+
'-----END CERTIFICATE-----'


//const jwksUrl = '...'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}


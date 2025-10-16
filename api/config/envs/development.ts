export default {
  // ENDPOINTS
  ENDPOINT: {
    APP: 'http://localhost:8081',
    API: 'http://localhost:4001',
  },

  // SENTRY
  SENTRY_DSN: '',

  CLERK: {
    PUBLISHABLE_KEY: 'pk_test_cmVzb2x2ZWQtdGljay03OC5jbGVyay5hY2NvdW50cy5kZXYk',
    JWT_KEY: `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv7VZmfdQ4bo4zvdCpuIv
xd5OPMxN+IzBOOwLfEuAM5vDDslE7qg5n32mACpO9q/icdsqxya6hreUQ2WPMXFU
EAFnyRk0ataxiOeffd/WtMGOwipH7gQXa4768YQI2s3lQ3etpy4AA+b8hJQghvfe
9dEp2Wgxr3njw5pNHPI432FIkfhDpIMT98nteNIRkwfvTQoXJ2u4fSRInZmZPcLK
tZFOXUYMIpUdQHraCyXA0d/JWgwOk6jArZ+nP/JVm6udtEbH7/+mRlsP/rUaW254
/i0SGtWqaw897yn6TQxGgjkuGdTgqpt5AdY2ic3jGsb9UdUV13r4dYUWICfwLc0d
VQIDAQAB
-----END PUBLIC KEY-----
`,
  },

  // VERCEL BLOB
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || '',
};

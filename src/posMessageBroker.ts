import socketIO from 'socket.io';
import jwt = require('jsonwebtoken');
import jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://bmsolution.auth0.com/.well-known/jwks.json'
});

export class PosMessageBroker {
  io: any;
  sockets = {};

  constructor(server) {
    this.io = socketIO(server);

    this.io.use((socket, next) => {
      const token = socket.handshake.query.token;

      jwt.verify(token, this.getKey, (err, decoded) => {
        if (err) {
          return next(new Error('authentication error'));
        }
        return next();
      });
    });

    this.io.on('connection', socket => {
      const tenantId = socket.handshake.query.tenantId;
      console.log('User connected: ' + tenantId);
      this.sockets[tenantId] = socket;

      // socket.on('sale', (data) => {

      //   console.log('emitting event to point');
      //   socket.broadcast.emit('point', data);
      // });
    });
  }

  sendMessage(tenantId, message) {
    const socket = this.sockets[tenantId];
    if (socket) {
      socket.emit('point', message);
      console.log('sendMessage to '  + tenantId);
    }
  }

  getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
      var signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }
}


import socketIO from 'socket.io';
import jwt = require('jsonwebtoken');
import jwksClient = require('jwks-rsa');

import { EventPublisher } from './shared/eventPublisher';
import { PointRequestedEvent } from './domains/customer/pointRequestedEventHandler';

const client = jwksClient({
  jwksUri: 'https://bmsolution.auth0.com/.well-known/jwks.json'
});

export class PosMessageBroker {
  io: any;
  sockets = {};

  constructor(server, public eventPublisher: EventPublisher) {
    this.io = socketIO(server);

    // middleware for authentication
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
      const { tenantId, source } = socket.handshake.query;
      console.log('User connected: ' + tenantId + '(' + source + ')');
      this.sockets[`${tenantId}@${source}`] = socket;

      Object.keys(this.sockets).forEach(k => console.log(k));

      socket.on('request', event => {
        this.handleRequest(event);
      });
    });
  }

  sendMessage(tenantId, message) {
    const socket = this.sockets[`${tenantId}@point`];
    if (socket) {
      socket.emit('point', message);
      console.log('sendMessage to ' + `${tenantId}@point`);
    }
  }

  sendMessageToPos(tenantId, message) {
    const socket = this.sockets[`${tenantId}@pos`];
    if (socket) {
      socket.emit('pos', message);
      console.log('sendMessage to ' + `${tenantId}@pos`);
    }
  }

  getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
      var signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  private handleRequest(event: any) {
    console.log(`handling ${event.type}`);
    switch (event.type) {
      case 'PointRequestedEvent': {
        this.eventPublisher.publish(new PointRequestedEvent(event.tenantId, event.saleId,
          event.phoneNumber, event.enablePoints));
          break;
      }
      default: {
        throw new Error(`Cannot find event handler for ${event.type}`);
      }
    }
  }
}


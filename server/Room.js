const colyseus = require('colyseus');

exports.Room = class extends colyseus.Room {
  onCreate (options) {
    console.log('room created!', this.roomName, this.roomId, options);
  }

  onJoin (client, options) {
    console.log('client joined!', this.roomName, this.roomId, client.id);
  }

  onMessage (client, message) {
    console.log('client message!', this.roomName, this.roomId, client.id, message);
  }

  onLeave (client, consented) {
    console.log('client left!', this.roomName, this.roomId, client.id);
  }

  onDispose() {
    console.log('room dispose!', this.roomName, this.roomId);
  }
}

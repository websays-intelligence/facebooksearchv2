const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor(host, port) {
    this.client = redis.createClient({
      host: host,
      port: port,
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis server');
    });

    this.client.on('error', (err) => {
      console.error(`Error connecting to Redis: ${err}`);
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.smembersAsync = promisify(this.client.smembers).bind(this.client);
  }

  async setKey(key, value) {
    await this.setAsync(key, value);
  }

  async getKey(key) {
    const value = await this.getAsync(key);
    return value
  }

  getKeyData(key) {
    this.client.get(key, (err, reply) => {
      return reply
    });
  }

  hgetallKey(key, callback) {
    this.client.hgetall(key, (err, reply) => {
        callback(err, reply);
    });
  }

  hgetallKey(key, callback) {
    this.client.hgetall(key, (err, reply) => {
        callback(err, reply);
    });
  }

  smembers(key, callback) {
    this.client.smembers(key, (err, reply) => {
      callback(err, reply)
    })
  }
  async smembersAsync(key) {
    const value = await this.smembersAsync(key);
    return value
  }
  sadd(key, args,callback) {
    this.client.sadd(key, args,(err, reply) => {
      callback(err, reply)
    })
  }

  quit() {
    this.client.quit();
  }
}

module.exports = RedisClient;
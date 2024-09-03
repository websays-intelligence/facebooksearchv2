const { PubSub } = require('@google-cloud/pubsub');
class Subscriber {
  
  constructor(projectId, subscribedTopics) {
    this.topicName = subscribedTopics
    this.pubsub = new PubSub({ projectId });
    this.subscription = pubsub.subscription(subscriptionName);
    

    this.subscription.on('message', this.messageHandler);
    this.client.on('connect', () => {
      console.log('Connected to Redis server');
    });

    this.client.on('error', (err) => {
      console.error(`Error connecting to Redis: ${err}`);
    });
  }

  messageHandler = (message) => {
    console.log("Manual Indexer message received")
    message.ack(); // Acknowledge the message
  };
}

module.exports = Subscriber;
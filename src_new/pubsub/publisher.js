const { PubSub } = require('@google-cloud/pubsub');
const {Storage} = require('@google-cloud/storage');

class Publisher {
  constructor(projectId, topicName) {

    const keyFileName = "wapi-websays.json"

    this.pubsub = new PubSub({
      projectId:"wapi-websays"
      });
    let topic = this.pubsub.topic(topicName);
    // console.log(topicName, projectId, topic)
    this.topicName = topicName
    this.projectId = projectId
   
  }

  

  async publishMessage(projectId = 'wapi-websays', // Your Google Cloud Platform project ID
  topicNameOrId = 'my-topic', // Name for the new topic to create
  subscriptionName = 'my-sub') {

    
    // Instantiates a client
    // let projectId = "wapi-websays"
    // let topicNameOrId = "wapi.twspider.communicator"
    // let subscriptionName = "wapi.twspider.communicator.job_runner"
    // const pubsub = new PubSub({projectId});
    // console.log("New publisher")
    // console.log("New")
    // this.pubsub = new PubSub({
    // });
  // console.log(this.pubsub)
    const [topics] = await this.pubsub.getTopics();
    console.log(topics.length)
    // topics.forEach((element)=> {
    //   console.log(element)
    // })
    console.log("New publisher")
    // Creates a new topic
    // const [topic] = await this.pubsub.createTopic(topicNameOrId);
    // console.log(`Topic ${topic.name} created.`);

    // Creates a subscription on that new topic
    // const [subscription] = await topic.createSubscription(subscriptionName);

    // Receive callbacks for new messages on the subscription
    // subscription.on('message', message => {
    //     console.log('Received message:', message.data.toString());
    //     process.exit(0);
    // });

    // // Receive callbacks for errors on the subscription
    // subscription.on('error', error => {
    //     console.error('Received error:', error);
    //     process.exit(1);
    // });

    // Send a message to the topic
    // topic.publishMessage({data: Buffer.from('Test message!')});
//     console.log("Publish Message")
//     try {
//         let pid = this.projectId
//         this.pubsub = new PubSub({
//             projectId: 'wapi-websays', // Replace with your actual project ID
//           });
//           console.log("after")
//         const [topics] = await this.pubsub.getTopics();
//         console.log("Topics")
//         topics.forEach(topic => {
//             console.log(topic.name);
//           });
//         // Creates a new topic
//         const [topic] = await this.pubsub.createTopic(this.topicName);
//         console.log("id created")
//         // Get a list of all topics in the project
//         // const [topics] = await this.pub.getTopics();
    
//         console.log('Topics:');
//         topics.forEach(topic => {
//           console.log(topic.name);
//         });
//       } catch (error) {
//         console.error('Error listing topics:', error);
//       }

//     const message = {
//       data: Buffer.from(data),
//       attributes: {},
//     };

//     console.log(this.topicName)
//     this.topicName = "projects/wapi-websays/topics/wapi.twspier.communicator"
//     let topic = this.pub.topic(this.topicName);
//     try {
//       const [messageId] = await topic.publishMessage(message);
//       console.log(`Message published with ID: ${messageId}`);
//     } catch (error) {
//       console.error(`Error publishing message: ${error}`);
//     }
   }
}

module.exports = Publisher;
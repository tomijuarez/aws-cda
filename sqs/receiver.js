const SQS = require('aws-sdk/clients/sqs');

const sqs = new SQS();

const STANDARD_QUEUE_NAME = 'node_standard-queue';

const computeQueueUrl = queueName => sqs.getQueueUrl({ QueueName: queueName }).promise();

const receiveMessagesWithoutVisibilityTimeout = async () => {
    const { QueueUrl } = await computeQueueUrl(STANDARD_QUEUE_NAME);

    const requestParams = {
        QueueUrl,
        VisibilityTimeout: 0
    };

    const message1 = await sqs.receiveMessage(requestParams).promise(); // get the next message in the queue
    const message2 = await sqs.receiveMessage(requestParams).promise(); // no visibility timeout, so it should be the same

    console.log("Is it the same message?", message1.Messages[0].MessageId === message2.Messages[0].MessageId);
    console.log(message1);
    console.log(message2);
};

const receiveMessageVisibilityTimeOut = async () => {

};

receiveMessagesWithoutVisibilityTimeout();
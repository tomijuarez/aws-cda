const SQS = require('aws-sdk/clients/sqs');
const uuid = require('uuid');

const sqs = new SQS();

const STANDARD_QUEUE_NAME = 'node_standard-queue';
const MESSAGES_NUMBER = 50;

const computeQueueUrl = queueName => sqs.getQueueUrl({ QueueName: queueName }).promise();

const sendMessage = data => sqs.sendMessage(data).promise();

const buildMessage = (queueUrl, id) => ({
    QueueUrl: queueUrl, MessageBody: JSON.stringify({ uuid: uuid.v4(), id: id })
});

const sendMessages = async () => {
    try {
        const { QueueUrl } = await computeQueueUrl(STANDARD_QUEUE_NAME);

        for(let i = 0; i < MESSAGES_NUMBER; i++) {
            await sendMessage(buildMessage(QueueUrl, i)); // await para mandar uno tras otro en orden.
        }
    } catch(e) {
        console.error("An unexpected error has occurred", e);
    }
};

sendMessages();
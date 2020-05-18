const SQS = require('aws-sdk/clients/sqs');
const uuid = require('uuid');

const sqs = new SQS();

const FIFO_QUEUE_NAME = 'node_fifo-queue.fifo';
const STANDARD_QUEUE_NAME = 'node_standard-queue';

const MESSAGES_NUMBER = 9;

const computeQueueUrl = queueName => sqs.getQueueUrl({ QueueName: queueName }).promise();

const sendMessage = data => sqs.sendMessage(data).promise();

const buildStandardMessage = (queueUrl, id) => ({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ uuid: uuid.v4(), id: id })
});

const sendStandardMessage = async _ => {
    try {
        const { QueueUrl } = await computeQueueUrl(STANDARD_QUEUE_NAME);

        for(let i = 0; i < MESSAGES_NUMBER; i++) {
            await sendMessage(buildStandardMessage(QueueUrl, i)); // await to send one after another
        }
    } catch(e) {
        console.error("An unexpected error has occurred", e);
    }
};

const buildFifoMessage = (queueUrl, id, groupId) => ({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ uuid: uuid.v4(), id: id }),
    MessageDeduplicationId: `${id}`,
    MessageGroupId: `${groupId}`
});

const sendFifoMessage = async groupId => {
    try {
        const { QueueUrl } = await computeQueueUrl(FIFO_QUEUE_NAME);

        for(let i = 0; i < MESSAGES_NUMBER; i++) {
            await sendMessage(buildFifoMessage(QueueUrl, groupId * 100 + i, groupId));
        }
    } catch(e) {
        console.error("An unexpected error has occurred", e);
    }
};

sendStandardMessage();

sendFifoMessage(1);
sendFifoMessage(2);
sendFifoMessage(3);
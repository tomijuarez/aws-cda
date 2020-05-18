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

const sendStandardMessage = async queueUrl => {
    try {
        for(let i = 0; i < MESSAGES_NUMBER; i++) {
            await sendMessage(buildStandardMessage(queueUrl, i)); // await to send one after another
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

const sendFifoMessage = async (queueUrl, groupId) => {
    try {
        for(let i = 0; i < MESSAGES_NUMBER; i++) {
            await sendMessage(buildFifoMessage(queueUrl, groupId * 100 + i, groupId));
        }
    } catch(e) {
        console.error("An unexpected error has occurred", e);
    }
};

(async () => { 
    const fifoQueueUrl = (await computeQueueUrl(FIFO_QUEUE_NAME)).QueueUrl;
    const standardQueueUrl = (await computeQueueUrl(STANDARD_QUEUE_NAME)).QueueUrl;

    /*
    * Deduplication ID no FIFO queues
    */
    const firstMessage = buildFifoMessage(fifoQueueUrl, 10000, 1111);
    //Different message content with same deduplicationId
    const secondMessage = buildFifoMessage(fifoQueueUrl, 10000, 9999);
    // Sends the message with deduplicationId 1000 - success.
    const firstMessageResult = await sendMessage(firstMessage);
    // Sends the message with deduplicationId 1000 and different content - it won't be delivered because of the
    // same deduplicationId and yet it is accepted, and no error thrown.
    const secondMessageResult = await sendMessage(secondMessage);

    // Either a failure/successful response won't throw an error.
    console.log(firstMessageResult);
    console.log(secondMessageResult);


    /*
    * Conventional message senders (standard and FIFO)
    */
    sendStandardMessage(standardQueueUrl);

    sendFifoMessage(fifoQueueUrl, 1);
    sendFifoMessage(fifoQueueUrl, 2);
    sendFifoMessage(fifoQueueUrl, 3);
})();
const redis = require('redis');

// Redis client setup
const redisClient = redis.createClient();  // Connect to Redis

// Subscriber logic to listen for notifications from Redis channels
redisClient.on('message', (channel, message) => {
  const notification = JSON.parse(message);

  // Example: Log the notification (you can replace this with actual notification delivery)
  console.log(`Sending notification to user ${notification.user_id}: ${notification.message}`);
});

// Subscribe to Redis channels for users
redisClient.subscribe('user:1:notifications');
redisClient.subscribe('user:2:notifications');
// Add more dynamic subscriptions if needed

// Log when the subscription is successful
redisClient.on('subscribe', (channel, count) => {
  console.log(`Subscribed to ${channel}. Total subscriptions: ${count}`);
});

// seed.js — load 100 fake posts into the leaderboard so you have data to rank.
// Run with:  npm run seed
//
// Each post needs BOTH:
//   - a hash  post:<id>:meta  with title + author
//   - a member in the sorted set trending:posts with a random starting score
//
// Use ONE pipeline for all the writes (200 commands, one round trip).

import { redis } from "./leaderboard.js";

async function seed() {

    // TODO: build a pipeline and, for i = 1..100:
  //   - HSET post:<i>:meta title "Post number <i>" author "@user<i>"
  //   - ZADD trending:posts <random 0-49> post:<i>
  //     (keep the range modest, e.g. Math.floor(Math.random() * 50),
  //      so a post upvoted 50 times is guaranteed to climb into the top 10)
  // Then: await pipeline.exec();

  // Clear the existing leaderboard


  await redis.del("trending:posts");

  // Create one pipeline
  const pipeline = redis.pipeline();

  // Generate 100 posts
  for (let i = 1; i <= 100; i++) {
    const postId = `post:${i}`;
    const score = Math.floor(Math.random() * 50);

    // Store post metadata in a Hash
    pipeline.hset(
      `${postId}:meta`,
      "title", `Post number ${i}`,
      "author", `@user${i}`
    );

    // Store post ranking in a Sorted Set
    pipeline.zadd("trending:posts", score, postId);
  }

  // Execute all 200 Redis commands together
  await pipeline.exec();

  console.log("Seeded 100 posts.");

  redis.disconnect();
}

seed();

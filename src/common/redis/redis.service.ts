import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async set(key: string, value: any) {
    return this.redis.set(key, value);
  }

  async del(key: string) {
    return this.redis.del(key);
  }

  // ❗ Upstash uses lowercase method names
  async sadd(key: string, value: string) {
    return this.redis.sadd(key, value);
  }

  async smembers(key: string) {
    return this.redis.smembers(key);
  }

  async srem(key: string, value: string) {
    return this.redis.srem(key, value);
  }

  async publish(channel: string, message: string) {
    return this.redis.publish(channel, message);
  }
}

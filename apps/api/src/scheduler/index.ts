import cron, { type ScheduledTask } from 'node-cron';
import { CronExpressionParser } from 'cron-parser';
import { publishTimesToCron } from '@bn/shared';
import { Channel, type ChannelDoc } from '../models/Channel.js';
import { logger } from '../config/logger.js';
import { runChannelPipeline } from '../pipeline/runner.js';

interface ChannelTask {
  channelId: string;
  cronExpr: string;
  task: ScheduledTask;
}

const tasks = new Map<string, ChannelTask[]>();

function buildCronList(channel: ChannelDoc): string[] {
  const times = (channel.publishTimes ?? []).filter(Boolean);
  const weekdays = channel.publishWeekdays?.length ? channel.publishWeekdays : [0, 1, 2, 3, 4, 5, 6];
  return publishTimesToCron(times, weekdays).filter((c) => cron.validate(c));
}

function startTaskForSlot(channel: ChannelDoc & { _id: any }, cronExpr: string): ScheduledTask {
  return cron.schedule(
    cronExpr,
    async () => {
      try {
        const fresh = await Channel.findById(channel._id);
        if (!fresh || !fresh.active) return;
        const count = Math.max(1, Math.min(10, fresh.postsPerSlot ?? 1));
        for (let i = 0; i < count; i++) {
          await runChannelPipeline(fresh, { trigger: 'cron', cronExpression: cronExpr });
        }
      } catch (err) {
        logger.error({ err, channel: channel.slug }, 'scheduler tick error');
      }
    },
    { timezone: channel.timezone || 'America/Sao_Paulo' } as any,
  );
}

export function rescheduleChannel(channel: ChannelDoc & { _id: any }): void {
  unscheduleChannel(String(channel._id));
  if (!channel.active) return;
  const expressions = buildCronList(channel);
  if (expressions.length === 0) return;
  const list: ChannelTask[] = expressions.map((expr) => ({
    channelId: String(channel._id),
    cronExpr: expr,
    task: startTaskForSlot(channel, expr),
  }));
  tasks.set(String(channel._id), list);
  logger.info(
    {
      channel: channel.slug,
      slots: list.map((t) => t.cronExpr),
      postsPerSlot: channel.postsPerSlot ?? 1,
    },
    'channel scheduled',
  );
}

export function unscheduleChannel(channelId: string): void {
  const list = tasks.get(channelId);
  if (!list) return;
  for (const t of list) t.task.stop();
  tasks.delete(channelId);
}

export async function bootstrapScheduler(): Promise<void> {
  const channels = await Channel.find({ active: true });
  for (const ch of channels) rescheduleChannel(ch as any);
  logger.info({ count: channels.length }, 'scheduler bootstrapped');
}

export function describeNextRuns(channelId: string, count = 3): { cron: string; next: string[] }[] {
  const list = tasks.get(channelId) ?? [];
  return list.map((t) => {
    try {
      const it = CronExpressionParser.parse(t.cronExpr, { tz: 'America/Sao_Paulo' });
      const next: string[] = [];
      for (let i = 0; i < count; i++) next.push(it.next().toDate().toISOString());
      return { cron: t.cronExpr, next };
    } catch {
      return { cron: t.cronExpr, next: [] };
    }
  });
}

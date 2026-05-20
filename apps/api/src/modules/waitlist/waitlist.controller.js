import { HTTP_STATUS } from '../../constants/http.js';
import { waitlistSignupSchema } from './waitlist.schema.js';
import { addToWaitlist } from './waitlist.service.js';

const clientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? null;
};

export const handleSignup = async (req, res) => {
  const input = waitlistSignupSchema.parse(req.body);

  const { entry, alreadyOnList } = await addToWaitlist({
    phone: input.phone,
    source: input.source,
    ip: clientIp(req),
    userAgent: req.get('user-agent') ?? null,
  });

  res.status(alreadyOnList ? HTTP_STATUS.OK : HTTP_STATUS.CREATED).json({
    entry,
    alreadyOnList,
  });
};

import asyncify from '@/lib/asyncify';
import session from '@/lib/session';
import oauth, { loginUrl } from '@/lib/oauth';

import validator, { Joi } from '@/middleware/validator';

import Member from '@/models/Member';

const controller = asyncify();

export const login = controller.get(
  '/login',
  session.isAnonymous(),
  (req, res) => {
    res.render('client/login', { loginUrl, layout: false });
  },
);

export const loginPlatform = controller.get(
  '/login/:platform',
  session.isAnonymous(),
  validator.query({
    code: Joi.string().required(),
  }),
  validator.params({
    platform: Joi.string().required(),
  }),
  async (req, res, transaction) => {
    const { platform } = req.params;
    const { code } = req.query;

    const auth = oauth[platform];

    if (!auth) {
      throw new Error('platform error');
    }

    let member = await auth(code);

    const dbMember = await Member.selectById(member.id)(transaction);
    const loginAt = new Date();
    if (!dbMember) {
      member = await Member.insertOne({ ...member, loginAt })(transaction);
    } else {
      member = {
        ...dbMember,
        loginAt,
      };
      await Member.updateOne(member, member.idx)(transaction);
    }

    if (!member.active) {
      res.redirect('/login?error=active');
      return;
    }

    if (member.withdraw) {
      res.redirect('/login?error=withdraw');
      return;
    }

    req.session.member = member;

    const redirect = req.cookies.redirect || '/';
    res.clearCookie('redirect');

    res.redirect(redirect);
  },
);

export default controller.router;

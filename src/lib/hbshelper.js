import moment from 'moment';
import htmlToText2 from 'html-to-text2';
import { formatDistance, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { go, map, reduce } from 'fxjs';

const core = {
  config: function(scope, namespace) {
    return `<script>CONFIG('${scope}', '${namespace}')</script>`;
  },
  store: function(states, option) {
    let session = option.data.root.session;

    const state = JSON.stringify({
      session: session.member
        ? {
            name: session.member.name,
            role_name: session.member.role_name,
            thumbnail: session.member.thumbnail,
          }
        : 'guest',
      ...states,
    });

    return `<script>STATE=${state};</script>`;
  },
};

const check = {
  isNull: function(v1) {
    return !v1;
  },
  ifNullDef: function(value, def) {
    if (value == null || value == undefined) return def;
    else return value;
  },
};

const convert = {
  /**
   * 날짜를 문자열로 변환
   * IN: 날짜(DATE), 포멧(STRING)
   * OUT: 문자(STRING)
   */
  parseDate: function(value, format) {
    if (value == 0 || !value || value == '') return '-';
    return moment(value).format(format);
  },
  /**
   * 날짜의 기간을 적절한 텍스트로 변환
   * IN: 날짜(DATE)
   * OUT: 문자(STRING)
   */
  parseDiffDate: function(date) {
    const now = new Date();
    const givenDate = new Date(date);
    const diff = now - givenDate;
    if (diff < 1000 * 60) {
      return '방금 전';
    }
    if (diff < 1000 * 60 * 60 * 24 * 7) {
      const distanceString = formatDistance(givenDate, now, {
        locale: ko,
        addSuffix: true,
      });
      return distanceString;
    }
    return format(givenDate, 'yyyy.MM.dd');
  },
  /**
   * 핸드폰 연락처 분할 처리
   * IN: 연락처(STRING), 자리수(INTEGER)
   * OUT: 문자(STRING)
   */
  parsePhone: function(phone, index) {
    if (
      !phone ||
      !phone.match(
        /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-[0-9]{3,4}-[0-9]{4}$/,
      ) ||
      (!index && index != 0)
    ) {
      return '-';
    }
    return phone.split('-')[index];
  },
  /**
   * 마크다운 처리
   * IN: 마크다운 태그(STRING)
   * OUT: 일반 문자열(STRING)
   */
  parseMarkdown: function(markdown, wordwrap) {
    markdown = markdown.replace(/(?:\r\n|\r|\n)/g, ' ');
    markdown = markdown.replace(/(<code data).*(<\/code>)/g, '');

    let text = htmlToText2.fromString(markdown, {
      ignoreHref: true,
      ignoreImage: true,
    });

    text = text.replace(/(?:\r\n|\r|\n)/g, ' ');
    return string.cutString(text, wordwrap).trim();
  },
};

const string = {
  /**
   * 통화 단위 콤마 삽입
   * IN: 정수(INTEGER)
   * OUT: 콤마가 삽입된 문자열(STRING)
   */
  decimal: function(value) {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  /**
   * 문자 사이에 문자 삽입
   * IN: 문자열 배열(ARRAY), 문자열(STRING)
   * OUT: 완성된 문자열(STRING)
   */
  unSplit: function(str, ...array) {
    return array.reduce((v1, v2) => v1 + str + v2);
  },
  /**
   * 문자열 축소 자르기
   * IN: 문자열(STRING), 최대 수(INTEGER)
   * OUT: 잘린 문자열(STRING)
   */
  cutString: function(value, max) {
    let isOver = true;
    if (max > value.length) {
      max = value.length;
      isOver = false;
    }
    return value.substring(0, max) + (isOver ? '...' : '');
  },
  /**
   * 문자열 자르기
   * IN: 문자열(STRING), 시작위치(INTEGER), 마지막위치(INTEGER)
   * OUT: 잘린 문자열(STRING)
   */
  subString: function(value, start, end) {
    if (!value) return '';
    return value.substring(start, end);
  },
};

const array = {
  /**
   * 반복문 제한
   * IN: 배열(ARRAY), 최대 수(INTEGER)
   * OUT: 배열(ARRAY)
   */
  eachLimit: function(ary, max, options) {
    if (!ary || ary.length == 0) return options.inverse(this);

    let result = [];
    for (let i = 0; i < max && i < ary.length; ++i)
      result.push(options.fn(ary[i]));

    return result.join('');
  },
  length: function(ary) {
    if (!ary || !(ary instanceof Array)) return 0;
    return ary.length;
  },
};

const html = {
  /**
   * 체크박스 체크 처리
   * IN: 체크박스(BOOLEAN)
   * OUT: 문자열(STRING)
   */
  checkbox: function(value) {
    return value == 1 ? 'checked=""' : '';
  },
  selected: function(v1, v2) {
    let vs1 = String(v1);
    let vs2 = String(v2);
    let rs = '';
    if (vs1 == vs2) {
      rs = 'selected=""';
    }
    return rs;
  },
  lineBreak: function(value) {
    if (!value || value == '') return '-';
    return value.replace(/(\n|\r\n)/g, '<br>');
  },
};

const condition = {
  ifPageNext: function(value, count, options) {
    if (value && value.length >= count) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  isNull: function(value, options) {
    if (value && value.length > 0) {
      return options.inverse(this);
    }
    return options.fn(this);
  },
  isNotNull: function(value, options) {
    if (value && value.length > 0) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  isAdmin: function(member, options) {
    if (member && member.role.indexOf('ADMIN') >= 0) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  neq: function(v1, v2, options) {
    if (v1 !== v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
};

const client = {
  isHotPost: function(value, options) {
    if (value && value >= 20) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  isNewPost: function(value, options) {
    let target = moment(value);
    let max = moment().format('YYYY-MM-DD HH:mm:ss');
    let min = moment()
      .subtract(5, 'days')
      .format('YYYY-MM-DD HH:mm:ss');

    if (target.isBetween(min, max)) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  isGoodPost: function(value, options) {
    if (value.length >= 10000) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  memberIdEllipse: function(value) {
    const [platform, id] = value.split('_');
    return `${platform}_${id.substring(0, 2)}*****`;
  },
};

const admin = {
  restDate: function(date) {
    const serverDate = moment(date);
    return Math.floor(moment.duration(serverDate.diff(moment())).asDays());
  },
  restPercent: function(date) {
    const serverDate = moment(date);
    const restDays = Math.floor(
      moment.duration(serverDate.diff(moment())).asDays(),
    );
    return 100 - Math.floor((restDays / 365) * 100);
  },
  restDonut: function(date) {
    const serverDate = moment(date);
    const restDays = Math.floor(
      moment.duration(serverDate.diff(moment())).asDays(),
    );

    return `${365 - restDays}/365`;
  },
  noteStyle: function(groups) {
    return `<style>
      ${go(
        groups,
        map(
          e =>
            `.note .lib .right .list ul a.group${e.idx}:hover {border-color: ${e.color};} .note .lib .right .list ul a.group${e.idx}:hover span {border-color: ${e.color};} .note .lib .right .list ul a.group${e.idx} .bar {background-color: ${e.color};}`,
        ),
        reduce((a, b) => `${a}${b}`),
      )}
    </style>`;
  },
};

export default Object.assign(
  core,
  check,
  convert,
  string,
  array,
  html,
  condition,
  client,
  admin,
);

import axios from '../helpers/axios';
import cheerio from 'cheerio';
import { concatPath, hasProtocol } from '../helpers/concatPath';

type EpisodeTopic = {
  comments: string[];
};

const BASE_URL = 'https://bgm.tv';

function extractURLFromUrl(value: string) {
  return value.replace(/url\((["'])(.*)\1\)/, '$2');
}

function fixURL(url: string, baseURL: string) {
  if (hasProtocol(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return concatPath(baseURL, url);
}

function extractSubReply(value: string) {
  if (value) {
    const params = value.replace(/subReply\((.*)\)/, '$1').split(',');
    return {
      postId: Number(params[2].trim()),
      subReplyId: Number(params[3].trim()),
      subReplyUId: Number(params[4].trim()),
      postUId: Number(params[5].trim()),
    };
  } else {
    return {
      postId: 0,
      subReplyId: 0,
      subReplyUId: 0,
      postUId: 0,
    };
  }
}

type Cheerio = ReturnType<ReturnType<typeof cheerio.load>['root']>;

function parseTopic(html: string) {
  const $ = cheerio.load(html);
  const $commentList = $('#comment_list .row_reply');
  const comments = [];
  for (let i = 0; i < $commentList.length; i++) {
    comments.push(extractPostInfo($commentList.eq(i), false));
  }
  return {
    comments,
  };
}

type Quote = {
  from: string;
  text: string;
};

type PostInfo = {
  id: number;
  floor: string;
  time: string;
  text: string;
  quote?: Quote;
  author: {
    name: string;
    id: number;
    msg: string;
    avatar: string;
  };
  replies?: PostInfo[];
};

function extractPostInfo($post: Cheerio, isReply: boolean): PostInfo {
  const id = Number(($post.attr('id') || '').split('_')[1] || 0);
  const floor = $post.find('.floor-anchor').first().text().replace(/#/, '');
  const time = $post.find('.re_info').first().text().split(' - ')[1].trim();
  const $author = isReply
    ? $post.find(`#${id}`)
    : $post.find(`.post_author_${id}`);
  const $cmtBtn = $post.find('.icons_cmt');
  const { postUId } = extractSubReply($cmtBtn.attr('onclick') || '');
  const author = {
    name: $author.text(),
    id: postUId,
    msg: $post.find('.tip_j').text(),
    avatar: fixURL(
      extractURLFromUrl($post.find('.avatarNeue').css('background-image')),
      'https://bgm.tv/ep/',
    ),
  };
  const ret = {
    id,
    floor,
    time,
    text: '',
    author,
  } as PostInfo;
  if (isReply) {
    const $quote = $post.find('.quote');
    ret.text = $post.find('.cmt_sub_content').text().trim();
    if ($quote.length) {
      const from = $quote.children().eq(0).children().eq(0).text();
      if (from) {
        const qouteText = $quote.text().trim();
        ret.text = ret.text.substring(qouteText.length).trim();
        const text = qouteText
          .substring(from.length)
          .trim()
          .replace(/^说: /, '');
        ret.quote = {
          from,
          text,
        };
      }
    }
  } else {
    ret.text = $post.find('.message').text().trim();
  }
  if (!isReply) {
    const replies = [];
    const $replies = $post.find('.topic_sub_reply').children();
    for (let i = 0; i < $replies.length; i++) {
      replies.push(extractPostInfo($replies.eq(i), true));
    }
    ret.replies = replies;
  }
  return ret;
}

export async function resolve(id: number, cookie: Record<string, string>) {
  const html = (
    await axios.get(`${BASE_URL}/ep/${id}`, {
      headers: {
        Cookie: ['chii_cookietime', 'chii_auth', 'chii_sid']
          .map((key) => (cookie[key] ? `${key}=${cookie[key]}` : ''))
          .filter(Boolean)
          .join('; '),
      },
    })
  ).data;

  return parseTopic(html);
}

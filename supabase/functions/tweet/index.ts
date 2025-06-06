/// <reference lib="deno.ns" />

import { serve } from 'https://deno.land/std@0.170.0/http/server.ts';

// --- Begin: react-tweet API functions (extracted and adapted) ---

const SYNDICATION_URL = 'https://cdn.syndication.twimg.com';
const TWEET_ID = /^[0-9]+$/;

class TwitterApiError extends Error {
  status;
  data;
  constructor({ message, status, data }) {
    super(message);
    this.name = 'TwitterApiError';
    this.status = status;
    this.data = data;
  }
}

function getToken(id) {
  // Using toString(36) since (6 ** 2) equals 36
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
}

/***********************
 * fetchTweet function *
 ***********************/

async function fetchTweet(id, fetchOptions) {
  if (id.length > 40 || !TWEET_ID.test(id)) {
    throw new Error(`Invalid tweet id: ${id}`);
  }

  const url = new URL(`${SYNDICATION_URL}/tweet-result`);
  url.searchParams.set('id', id);
  url.searchParams.set('lang', 'en');
  url.searchParams.set(
    'features',
    [
      'tfw_timeline_list:',
      'tfw_follower_count_sunset:true',
      'tfw_tweet_edit_backend:on',
      'tfw_refsrc_session:on',
      'tfw_fosnr_soft_interventions_enabled:on',
      'tfw_show_birdwatch_pivots_enabled:on',
      'tfw_show_business_verified_badge:on',
      'tfw_duplicate_scribes_to_settings:on',
      'tfw_use_profile_image_shape_enabled:on',
      'tfw_show_blue_verified_badge:on',
      'tfw_legacy_timeline_sunset:true',
      'tfw_show_gov_verified_badge:on',
      'tfw_show_business_affiliate_badge:on',
      'tfw_tweet_edit_frontend:on'
    ].join(';')
  );
  url.searchParams.set('token', getToken(id));

  const res = await fetch(url.toString(), fetchOptions);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : undefined;

  if (res.ok) {
    if (data?.__typename === 'TweetTombstone') {
      return { tombstone: true };
    }
    return { data };
  }
  if (res.status === 404) {
    return { notFound: true };
  }

  throw new TwitterApiError({
    message:
      typeof data.error === 'string'
        ? data.error
        : `Failed to fetch tweet at "${url}" with "${res.status}".`,
    status: res.status,
    data,
  });
}

// --- End: fetchTweet function ---

// --- Begin: Utilities for tweet enrichment ---

function getTweetUrl(tweet) {
  return `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
}

// A simplified version of enrichTweet; it adds additional URL fields to the tweet object.
function enrichTweet(tweet) {
  return {
    ...tweet,
    url: getTweetUrl(tweet),
    user: {
      ...tweet.user,
      url: `https://x.com/${tweet.user.screen_name}`,
      follow_url: `https://x.com/intent/follow?screen_name=${tweet.user.screen_name}`
    },
    like_url: `https://x.com/intent/like?tweet_id=${tweet.id_str}`,
    reply_url: `https://x.com/intent/tweet?in_reply_to=${tweet.id_str}`,
    in_reply_to_url: tweet.in_reply_to_status_id_str ? `https://x.com/${tweet.in_reply_to_screen_name}/status/${tweet.in_reply_to_status_id_str}` : undefined,
  };
}

// --- End: Utilities for tweet enrichment ---

console.log('Starting edge function');

serve(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const tweetId = searchParams.get('id');
    if (!tweetId) {
      return new Response(JSON.stringify({ error: 'Missing tweet id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch tweet using our inline function
    const result = await fetchTweet(tweetId);

    // If tweet is not found or is a tombstone, return error
    if (result.tombstone || result.notFound || !result.data) {
      return new Response(JSON.stringify({ error: 'Tweet not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Enrich the tweet data
    const enrichedTweet = enrichTweet(result.data);

    return new Response(JSON.stringify(enrichedTweet), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching tweet:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}); 
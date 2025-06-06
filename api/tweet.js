import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { getTweet } from "react-tweet/api";
import { renderToString } from "react-dom/server";
import { EmbeddedTweet } from "react-tweet";

// Load the Twitter theme CSS
import tweetStyles from "react-tweet/theme.css";

export const config = {
  runtime: "edge",
};

async function generateTweetImage(tweet) {
  // Launch headless Chrome
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 550, height: 400 }, // Twitter's default width
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();

  // Create HTML with the tweet and styles
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${tweetStyles}</style>
      </head>
      <body style="margin: 0; background: white;">
        ${renderToString(<EmbeddedTweet tweet={tweet} />)}
      </body>
    </html>
  `;

  await page.setContent(html);

  // Wait for images to load
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Take screenshot
  const screenshot = await page.screenshot({
    type: "png",
    omitBackground: true,
  });

  await browser.close();
  return screenshot;
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tweetId = searchParams.get("id");
    const format = searchParams.get("format")?.toLowerCase();

    if (!tweetId) {
      return new Response("Missing tweet ID", { status: 400 });
    }

    const tweet = await getTweet(tweetId);

    // Return JSON if format is not 'image'
    if (format !== "image") {
      return new Response(JSON.stringify(tweet), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate and return image
    const image = await generateTweetImage(tweet);
    return new Response(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

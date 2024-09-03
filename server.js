const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const proxyChain = require('proxy-chain');
const axios = require('axios');
const RedisClient = require('./src_new/redis/redis');
const config = require('config');
const Publisher = require('./src_new/pubsub/publisher')
const { forEach } = require('lodash');
const projectId = 'wapi-websays';
const publishingTopic = 'wapi.fbspider.communicator';
const redisClient = new RedisClient(config.get('redis.host'), config.get('redis.port'));
redisClient.sadd("fb_channels", ["facebook", "Meta", "anotherPage", "yetAnotherPage"], (err, value) => {
});
redisClient.sadd("fb_proxy_users", ["carolynkingnerg,&1@l5P#pUQ71,http://8oqlg3EBtl:XWWHWa1K5S@81.21.230.99:58542", "sabyadit,qC@43n69i#Wz,http://8oqlg3EBtl:XWWHWa1K5S@194.38.59.106:58542", "unaalsopoerp,5@!FvyS5389T,http://8oqlg3EBtl:XWWHWa1K5S@212.80.210.143:58542","krupaahleaftf,ANAVQp1EvW9Lae2AZGy,http://8oqlg3EBtl:XWWHWa1K5S@85.115.194.200:58542","donldmekaylahcyp,P3wbT6N$2DLf12,http://8oqlg3EBtl:XWWHWa1K5S@88.135.67.21:58542"], (err, value) => {
})
let browsers = [];
async function launchBrowser(proxyUrl, user) {
  let newproxy = await proxyChain.anonymizeProxy(proxyUrl);
  let browser = await puppeteer.launch({
    headless: true,
    args: [
      `--proxy-server=${newproxy}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.45 Safari/537.36'
    ],
    userDataDir: `./cache/user_${user}`
  });
  browsers.push({ browser: browser, user: user, proxy: proxyUrl });
  return browser;
}
async function scrollToEnd(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const maxScrollAttempts = 10;
      let scrollAttempt = 0;

      function scroll() {
        window.scrollTo(0, document.body.scrollHeight);
        scrollAttempt++;

        if (scrollAttempt < maxScrollAttempts) {
          requestAnimationFrame(scroll);
        } else {
          resolve();
        }
      }

      scroll();
    });
  });
}
async function processLink(browser, postUrl, dateKey, dateValue, ogAuthorImageContent, ogAuthorDescription, authorUrl, profileId, postTitle) {
  const page = await browser.newPage();
  try {
    await page.goto(postUrl);
  } catch (error) {
    return false;
  }
  await new Promise(r => setTimeout(r, 30000));

  const htmlContent = await page.content();
  const $ = cheerio.load(htmlContent);

  // Modify selectors based on Facebook's structure
  const ogImageContent = $("meta[property='og:image']").attr('content');
  const ogTitleContent = $("meta[property='og:title']").attr('content');
  const ogDescriptionContent = $("meta[property='og:description']").attr('content');

  const datetime = $('abbr').first().attr('data-utime');
  const unixTimestamp = Math.floor(datetime);

  let jsonData = {
    title: ogTitleContent,
    description: ogDescriptionContent,
    image: ogImageContent,
    time: unixTimestamp,
    authorImage: ogAuthorImageContent,
    authorDescription: ogAuthorDescription,
    authorUrl: authorUrl,
    profileId: profileId,
    postUrl: postUrl,
    postTitle: ogTitleContent
  };

  const apiUrl = 'https://wapi.websays.com/winput/fb/spider/clippings';
  page.close();

  if (dateValue != null) {
    if (unixTimestamp > dateValue) {
      let redisTimeStamp = await redisClient.getKey(dateKey);
      let redisDateValue = parseInt(redisTimeStamp, 10);

      if (!redisTimeStamp) {
        redisDateValue = 0;
      }

      if (unixTimestamp > redisDateValue) {
        await redisClient.setKey(dateKey, unixTimestamp);
      }
      try {
        const response = await axios.post(apiUrl, jsonData);
      } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
          console.error('Response Data:', error.response.data);
        }
        return false;
      }

    } else {
      return false;
    }
  } else {
    await redisClient.setKey(dateKey, unixTimestamp);
    try {
      const response = await axios.post(apiUrl, jsonData);
    } catch (error) {
      console.error('Error:', error.response.data || error.message);
      return false;
    }
  }
  return true;
}
async function login(user, password, browser) {
  const page = await browser.newPage();
  try {
    await page.goto('https://www.facebook.com/login');
    await new Promise(r => setTimeout(r, 5000));

    await page.type('input[name="email"]', user);
    await page.type('input[name="pass"]', password);

    await page.click('button[name="login"]');
    await new Promise(r => setTimeout(r, 10000));
  } catch (error) {
    console.log("Error during login:", error);
  }
}

function randomlyRotateArray(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const rotatedArray = arr.slice(randomIndex).concat(arr.slice(0, randomIndex));
  return rotatedArray;
}

async function main() {
  const mainLink = "https://www.facebook.com/";

  var browserCount = 0;
  redisClient.smembers("fb_channels", async (err, values) => {
    values = randomlyRotateArray(values);
    for (var i = 0; i < values.length; i++) {
      let browser = browsers[browserCount].browser;
      browserCount++;
      if (browserCount == browsers.length) {
        browserCount = 0;
      }

      let value = values[i];
      channelsArray = value.split(':');
      channelId = channelsArray[0];
      url = mainLink + channelsArray[1];
      let newPage = await browser.newPage();
      try {
        await newPage.goto(url);
      } catch (error) {
        continue;
      }
      await new Promise(r => setTimeout(r, 10000));

      htmlContent = await newPage.content();
      $ = cheerio.load(htmlContent);

      newPage.close();
      const ogAuthorImageContent = $("meta[property='og:image']").attr('content');
      const ogAuthorDescription = $("meta[property='og:description']").attr('content');
      const postTitle = $("meta[property='og:description']").attr('content');
      const article = $('div[data-pagelet="MainFeed"]'); // Adjust based on actual Facebook structure

      dateKey = channelId + "_" + url + "_lasttime";
      let data = await redisClient.getKey(dateKey);

      const children = article.find('div[data-ad-preview="message"]'); // Adjust based on actual Facebook structure

      var start = 0;
      var end = children.length;
      if (data == null) {
        start = children.length - 1;
        end = 0;
      }

      for (var j = start;;) {
        let dateValue = 0;
        if (data == null) {
          if (j <= end) {
            break;
          }
        } else {
          dateValue = parseInt(data, 10);
          if (j > end) {
            break;
          }
        }
        var child = children[j];
        const postUrl = mainLink + $(child).find('a').attr('href');

        var forward = await processLink(browser, postUrl, dateKey, dateValue, ogAuthorImageContent, ogAuthorDescription, url, channelId, postTitle);
        if (!forward && j >= 3) {
          break;
        }

        if (data == null) {
          j--;
        } else {
          j++;
        }
      }
    }
  });

  await new Promise(r => setTimeout(r, 24 * 60 * 60 * 1000));
}

const loop = async () => {
  var users = await redisClient.smembersAsync("fb_proxy_users");

  for (var j = 0; j < users.length; j++) {
    const dataArray = users[j].split(',');
    browser = await launchBrowser(dataArray[2], dataArray[0]);
    await login(dataArray[0], dataArray[1], browser);
  }

  for (;;) await main();
};

loop();
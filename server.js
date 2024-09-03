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
    let newproxy = await proxyChain.anonymizeProxy(proxyUrl)
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
    const browserData = { browser: browser, user: user, proxy: proxyUrl};
    browsers.push(browserData)
    return browser
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
  const page = await browser.newPage()
  try {
    await page.goto(postUrl);
  } catch (error) {
    return false
  }
  await new Promise(r => setTimeout(r, 30000));
  const htmlContent = await page.content();
const $ = cheerio.load(htmlContent);
  const image = $("meta[property='og:image']");
  const ogImageContent = image.attr('content');
  const ogTitle = $("meta[property='og:title']");
  const ogTitleContent = ogTitle.attr('content');
  const ogDescription = $("meta[name='description']");
  const ogDescriptionContent = ogDescription.attr('content');
  const firstTimeTag = $('time').first();
 const datetime = firstTimeTag.attr('datetime');
  const title = firstTimeTag.attr('title');
  const content = firstTimeTag.text();
  const dateObject = new Date(datetime);
  const unixTimestamp = Math.floor(dateObject.getTime() / 1000);
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
  const apiUrl = 'https://wapi.websays.com/winput/ig/spider/clippings';
  page.close()
  if (dateValue!=null) {
    if(unixTimestamp > dateValue) {
      let redisTimeStamp = await redisClient.getKey(dateKey)
      let redisDateValue = parseInt(redisTimeStamp, 10);
      if (!redisTimeStamp) {
        redisDateValue = 0
      }
      if (unixTimestamp > redisDateValue) {
        await redisClient.setKey(dateKey, unixTimestamp)
      }
      try {
        const response = await axios.post(apiUrl, jsonData);
      } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
          console.error('Response Data:', error.response.data);
        }
        return false
      }
    } else {
      return false
    }
  } else {
    await redisClient.setKey(dateKey, unixTimestamp)
    try {
      const response = await axios.post(apiUrl, jsonData);
    } catch (error) {
      console.error('Error:', error.response.data || error.message);
      return false
    }
  }
  return true
}
async function login(user, password, browser) { 
  try {
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher');
    await new Promise(r => setTimeout(r, 5000));
    const dialogDiv = await page.$('div[role="dialog"]');
    if (dialogDiv) {
        const buttonsInsideDialog = await dialogDiv.$$('button');
        const secondToLastButtonIndex = buttonsInsideDialog.length - 2;
        if (secondToLastButtonIndex >= 0) {
          await buttonsInsideDialog[secondToLastButtonIndex].click();
          await new Promise(r => setTimeout(r, 10000));
        } else {
        }
    } else {
    }
    await new Promise(r => setTimeout(r, 2000));
    await page.type('input[name="username"]', user);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 10000));
  } catch (error) {    
  }
}
function randomlyRotateArray(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const rotatedArray = arr.slice(randomIndex).concat(arr.slice(0, randomIndex));
  return rotatedArray;
}
async function main() {
  const mainLink = "https://www.instagram.com/"
  var browserCount = 0
  redisClient.smembers("ig_channels", async (err, values) => {
    values = randomlyRotateArray(values);
    for(var i=0; i<values.length; i++) {
      let browser = browsers[browserCount].browser
      browserCount++
      if (browserCount == browsers.length) {
        browserCount = 0
      }
      let value = values[i]
      channelsArray = value.split(':')
      channelId = channelsArray[0]
      url = mainLink + channelsArray[1]
      let newPage = await browser.newPage();
      try {
        await newPage.goto(url)
      } catch (error) {
        continue
      }
      await new Promise(r => setTimeout(r, 10000));
      htmlContent = await newPage.content();
      $ = cheerio.load(htmlContent);
      newPage.close()
      const authorImage = $("meta[property='og:image']");
      const ogAuthorImageContent = authorImage.attr('content');
      const authorDescription = $("meta[property='og:description']");
      const ogAuthorDescription = authorDescription.attr('content');
      const postTitle = $("meta[property='og:description']");
      const postTitleDescription = authorDescription.attr('content');
      const article = $('article');
      const children = article.children();
      dateKey = channelId+"_"+url+"_lasttime"
      let data = await redisClient.getKey(dateKey)
      const child = $(children[0]);
      const grandchildren = child.find('a');
      var start = 0
      var end = grandchildren.length
      if (data == null) {
        start = grandchildren.length - 1
        end = 0
      }
      for (var j = start;; ) {
        let dateValue = 0;
        if (data == null) {
          if (j<=end) {
            break
          }
        } else {
          dateValue = parseInt(data, 10);
          if (j>end) {
            break
          }
        }
          var grandchildElement = grandchildren[j]
          const link = $(grandchildElement);
          const href = link.attr('href');
          const text = link.text();
          var postUrl = mainLink + href
          var forward = await processLink(browser, postUrl, dateKey, dateValue, ogAuthorImageContent, ogAuthorDescription, url, channelId, postTitle)
          if (!forward && j >= 3) { 
            break;
          }
          if (data == null) {
            j--
          } else {
            j++
          }
        }
    }
  })  
  await new Promise(r => setTimeout(r, 24* 60 * 60 *1000));  
}
const loop = async () => {
  var users = await redisClient.smembersAsync("ig_proxy_users")
  for (var j=0; j<users.length; j++) {
    const dataArray = users[j].split(',');
    browser = await launchBrowser(dataArray[2], dataArray[0])
    await login(dataArray[0], dataArray[1], browser)
  }
  for (;;) await main()
}
loop()
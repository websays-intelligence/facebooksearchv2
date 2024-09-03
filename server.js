const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const proxyChain = require('proxy-chain')
const axios = require('axios');


const RedisClient = require('./src_new/redis/redis');
const Publisher = require('./src_new/pubsub/publisher')
const config = require('config');
const { forEach } = require('lodash');

// Replace 'your-redis-host' and 'your-redis-port' with the actual host and port of your Redis server
const projectId = 'wapi-websays';
const publishingTopic = 'wapi.twspider.communicator';
const redisClient = new RedisClient(config.get('redis.host'), config.get('redis.port'));

redisClient.sadd("ig_channels",["2946:nuriaparlon", "2946:socpilardiaz","2946:albiol_xg","2946:lluisamoret","2946:socmartafarres","2946:mariaeugeniagay","2946:candelalopezt","2946:marc_castellsb","2946:eva.baro.ramos","2946:triadojosep","2946:dibacat", "4182:occidentseguros", "3704:rabatjewellery", "3704:rabatwatches", "3679:creditoycaucion", "3678:fundacionoccident", "3713:gobjccm", "3713:turismocastillalamancha", "3713:garciapage", "3713:pscmpsoe", "3713:economiaclm", "3713:juventudclm", "3750:lipasamsevilla", "4021:joseluisfabrega", "4014:csspanama", "4015:enriquelaucortes", "4105:serviestibasa", "4195:martintorrijos", "4194:gabycarrizoj", "4111:mininteriorrd", "4112:chuvasquez", "4215:dilianfranciscat", "4022:municipiodepanama", "4216:laareperia_vamoscontodo", "4216:taggoconstructora", "4216:dontulio_carnesgourmet", "4216:lamontanaagromercados", "4216:americadecali", "4216:tulioagomezg", "4230:ferneylozanoc", "4247:jorgeglasespinel", "4248:fdzwaldo", "4255:veroniabad", "2709:barcelonabridalfashionweek_","4263:Chuster_yt", "4263:albertisment_"], (err, value) => {
  console.log(value)
})



redisClient.sadd("ig_proxy_users",["carolynkingnerg,&1@l5P#pUQ71,http://8oqlg3EBtl:XWWHWa1K5S@81.21.230.99:58542", "sabyadit,qC@43n69i#Wz,http://8oqlg3EBtl:XWWHWa1K5S@194.38.59.106:58542", "unaalsopoerp,5@!FvyS5389T,http://8oqlg3EBtl:XWWHWa1K5S@212.80.210.143:58542","krupaahleaftf,ANAVQp1EvW9Lae2AZGy,http://8oqlg3EBtl:XWWHWa1K5S@85.115.194.200:58542","donldmekaylahcyp,P3wbT6N$2DLf12,http://8oqlg3EBtl:XWWHWa1K5S@88.135.67.21:58542"], (err, value) => {
  console.log(value)
})

/**Create browser */
let browsers = []; // Declare the browser variable in a higher scope

// const proxyServer = 'http://your-username:your-password@your-proxy-server:your-proxy-port';
// const encodedUsername = encodeURIComponent('8oqlg3EBtl');
// const encodedPassword = encodeURIComponent('XWWHWa1K5S');

async function launchBrowser(proxyUrl, user) {
  
  console.log(proxyUrl)
    // const proxyServer = `http://8oqlg3EBtl:XWWHWa1K5S@193.35.90.99:58542`;
    let newproxy = await proxyChain.anonymizeProxy(proxyUrl)

    // If the browser instance doesn't exist, create one
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

// const proxyServer = 'http://your-username:your-password@your-proxy-server:your-proxy-port';
// const encodedUsername = encodeURIComponent('8oqlg3EBtl');
// const encodedPassword = encodeURIComponent('XWWHWa1K5S');
// const proxyServer = `http://8oqlg3EBtl:XWWHWa1K5S@193.35.90.99:58542`;
// const newproxy = await proxyChain.anonymizeProxy(proxyServer)


// Function to scroll to the bottom of the page
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

  console.log("Author Image", ogAuthorImageContent)
  console.log("Author Description", ogAuthorDescription)
  const page = await browser.newPage()

  try {
    await page.goto(postUrl);
  } catch (error) {
    return false
  }
  // Wait for the login process to complete
  await new Promise(r => setTimeout(r, 30000));
  // Get the HTML content
  const htmlContent = await page.content();

  // Use Cheerio to parse the HTML
  const $ = cheerio.load(htmlContent);
  const image = $("meta[property='og:image']");

  const ogImageContent = image.attr('content');

  // Print or use the og:title content as needed
  console.log('og:Image content:', ogImageContent);

  const ogTitle = $("meta[property='og:title']");

  const ogTitleContent = ogTitle.attr('content');

  // Print or use the og:title content as needed
  console.log('og:Title content:', ogTitleContent);

  const ogDescription = $("meta[name='description']");

  const ogDescriptionContent = ogDescription.attr('content');

  // Print or use the og:title content as needed
  console.log('ogdescription content:', ogDescriptionContent);


  const firstTimeTag = $('time').first();

  // Get the datetime and title attributes
  const datetime = firstTimeTag.attr('datetime');
  const title = firstTimeTag.attr('title');

  // Get the text content within the first time tag
  const content = firstTimeTag.text();

  // Convert the string to a Date object
  const dateObject = new Date(datetime);

  // Get the Unix timestamp (in seconds)
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
      console.log("Send:", redisTimeStamp, redisDateValue, dateValue, unixTimestamp, unixTimestamp > redisDateValue)
      try {
        const response = await axios.post(apiUrl, jsonData);
      } catch (error) {
        // Handle errors
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
    console.log("Null send")
    await redisClient.setKey(dateKey, unixTimestamp)
    try {
      const response = await axios.post(apiUrl, jsonData);
    } catch (error) {
      // Handle errors
      console.error('Error:', error.response.data || error.message);
      return false
    }
  }
  console.log('UnixTimeStamp',unixTimestamp);
  console.log('Datetime:', datetime);
  console.log('Title:', title);
  console.log('Content:', content);
  return true
}

async function login(user, password, browser) {
  
  console.log("Username:", user)
  try {
    // Open a new page
    const page = await browser.newPage();

    // Navigate to Instagram login page
    await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher');
    // var htmlContent = await page.content();
    // var $ = cheerio.load(htmlContent);

    await new Promise(r => setTimeout(r, 5000));
    // Use page.$ to find the div with role="dialog"
    const dialogDiv = await page.$('div[role="dialog"]');

    if (dialogDiv) {
        // Get all buttons inside the dialog
        const buttonsInsideDialog = await dialogDiv.$$('button');
    
        // Click the second-to-last button (if it exists)
        const secondToLastButtonIndex = buttonsInsideDialog.length - 2;
    
        if (secondToLastButtonIndex >= 0) {
          await buttonsInsideDialog[secondToLastButtonIndex].click();
          await new Promise(r => setTimeout(r, 10000));
        
        } else {
          console.log('Dialog does not have a second-to-last button');
        }

    } else {
      console.log('Did not find the <div> with role="dialog"');
    }


    // Wait for the login page to load
    await new Promise(r => setTimeout(r, 2000));

    // Fill in the login form
    await page.type('input[name="username"]', user);
    await page.type('input[name="password"]', password);

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for the login process to complete
    await new Promise(r => setTimeout(r, 10000));
  } catch (error) {
    
    console.log("Error during login:", error)
  }

}

function randomlyRotateArray(arr) {
  // Generate a random index within the length of the array
  const randomIndex = Math.floor(Math.random() * arr.length);

  // Rotate the array by slicing and concatenating
  const rotatedArray = arr.slice(randomIndex).concat(arr.slice(0, randomIndex));

  return rotatedArray;
}


async function main() {
  // subscribeToMessages()


  const mainLink = "https://www.instagram.com/"

  var browserCount = 0

  redisClient.smembers("ig_channels", async (err, values) => {
    values = randomlyRotateArray(values);
    console.log(values)
    for(var i=0; i<values.length; i++) {

      let browser = browsers[browserCount].browser
      browserCount++
      if (browserCount == browsers.length) {
        browserCount = 0
      }
      console.log("---------------------Changing Channel------------------------------------")      
      // let value = '2946:lluisamoret'
      let value = values[i]
      channelsArray = value.split(':')
      channelId = channelsArray[0]
      console.log("ChannelId:", channelId)
      console.log("User", browsers[browserCount].user)
      console.log("Proxy", browsers[browserCount].proxy)
      console.log("Channel Count", i+1)
      console.log("---------------------Changing Channel------------------------------------")
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

      console.log("Data", data)

      const child = $(children[0]);

      // Find all children of the current child
      const grandchildren = child.find('a');
      console.log(grandchildren.length)

      var start = 0
      var end = grandchildren.length
      if (data == null) {
        start = grandchildren.length - 1
        end = 0
      }

      // Print the text content of each grandchild
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
          console.log(`Link: ${text} (${href})`);

          var postUrl = mainLink + href

          console.log(postUrl)
          
          var forward = await processLink(browser, postUrl, dateKey, dateValue, ogAuthorImageContent, ogAuthorDescription, url, channelId, postTitle)
          if (!forward && j >= 3) { //As first 3 posts can be pinned, have to check 4 posts atleast on a channel
            break
          }
    
          if (data == null) {
            j--
          } else {
            j++
          }
          
        }
          // }
        // });
        console.log(url)
      // })
    }
  })  
  

  // Wait for 24 hours for next scapping
  await new Promise(r => setTimeout(r, 24* 60 * 60 *1000));
  
}


//TODO: Check the datetime of last post in order to decide if need to scroll or not

const loop = async () => {
  console.log("starting")
  var users = await redisClient.smembersAsync("ig_proxy_users")

  for (var j=0; j<users.length; j++) {
    const dataArray = users[j].split(',');
    browser = await launchBrowser(dataArray[2], dataArray[0])
    await login(dataArray[0], dataArray[1], browser)
  }
  // await new Promise(r => setTimeout(r, 1000000));
  
  for (;;) await main()
}

loop()

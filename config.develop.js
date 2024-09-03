// process.env.SERVER_WINPUT = 'https://wapi-beta.websays.com/'
// process.env.REDIS_HOST = 'localhost:6379'
// The users are not registred in facebook. We are not using login
module.exports = {
  server_winput: process.env.SERVER_WINPUT,
  redis_host: process.env.REDIS_HOST,
  parallel_jobs: 1,
  queryWaitSeconds: [600, 301], // Sleep between queries: between 600 & 900 seconds (10 to 15 minutes)
  restTimeWaitSeconds: [1800, 901], // Sleep every 3 hours: between 1800 & 2700 seconds (30 to 45 minutes)
  noUsersQueryWaitSeconds: [3600, 1], // Sleep when no available users: 3600 seg to get next user again (1 hour)
  number_scrolls: 3, // Number of scrolls for each query
  historical_scrolls: 200, // Maxim number of scrolls for each hitorical query
  old_articles_break: 40, // limit of old articles to break article union process
  // holeHistoric: true,
  timeout_scroll: [3, 6], //  Sleep between scrolls: between 3 & 8 seconds
  timeout_navigation: [6, 10], // Sleep to close page: between 6 seconds & 15 seconds
  debug_logs: false,
  proxyBrowser: (user, proxy) => ({
    headless: true, // En false se lanzaría el navegador visualmente
    devtools: false, // En true se lanzara la consola de chrome
    args: [
      '--no-sandbox',
      `--proxy-server=${proxy}`,
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.45 Safari/537.36'
    ],
    userDataDir: `./cache/user_${user.id}`
  })
}

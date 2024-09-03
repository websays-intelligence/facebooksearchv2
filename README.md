# facebooksearchv2
Facebook Spider


# facebooksearch

Depenendencias:

* Node.js > 10

* Paquetes de Debian dependientes:

```sh
apt install gconf-service \
libasound2 \
libatk1.0-0 \
libatk-bridge2.0-0 \
libc6 \
libcairo2 \
libcups2 \
libdbus-1-3 \
libexpat1 \
libfontconfig1 \
libgcc1 \
libgconf-2-4 \
libgdk-pixbuf2.0-0 \
libglib2.0-0 \
libgtk-3-0 \
libnspr4 \
libpango-1.0-0 \
libpangocairo-1.0-0 \
libstdc++6 \
libx11-6 \
libx11-xcb1 \
libxcb1 \
libxcomposite1 \
libxcursor1 \
libxdamage1 \
libxext6 \
libxfixes3 \
libxi6 \
libxrandr2 \
libxrender1 \
libxss1 \
libxtst6 \
ca-certificates \
fonts-liberation \
libappindicator1 \
libnss3 \
lsb-release \
xdg-utils \
wget
```

Instalación de dependencias de Node.js:

```sh
npm i
```

Configuraciones de chrome:
* En "configuracion" -> "contenido" se puede deshabilitar las notificaciones, carga de imagenes, flash y otros.

JSON TO WEBSAYS:

```json
{
  "user_followers":7,
  "user_name":"Jaume",
  "article_type":"video",
  "article_url":"https://www.facebook.com/p/_aw-VIDDA-/",
  "article_media_url":"https://scontent-mad1-1.cdnfacebook.com/vp/1e2c83b4055d0398e5e514828de76089/5C5278D5/t50.2886-16/12344303_1528615337451080_871315622_n.mp4?_nc_ht=scontent-mad1-1.cdnfacebook.com",
  "article_username":"abertis",
  "article_likes":1,
  "article_hole_text":"abertis\nHoy no hace muy bueno que se diga... #maltiempo",
  "article_comments":[
      {
          "user":"abertis",
          "message":"Hoy no hace muy bueno que se diga... #maltiempo"
      }
  ],
  "article_date":"2015-12-18T03:33:03.000Z"
}
```

```go
type Clipping struct {
  ClippingID string `json:"ID"`
  Domain string `json:"domain"`
  URL    string `json:"url"`
  MediaURLs []string `json:"mediaURLs"`
  Title   string `json:"title"`
  Snippet string `json:"snippet"`
  Text    string `json:"text"`
  ThreadID        string `json:"threadID"`
  ThreadParentID  string `json:"threadParentID"`
  ThreadEntryType string `json:"threadEntryType"`
  Location       wapi.Location `json:"location"`
  ChannelID      string        `json:"channelID"`
  ScreenName     string        `json:"screenName"`
  FollowersCount int64         `json:"followersCount,omitempty"`
  CommentsCount int64 `json:"commentsCount,omitempty"`
  LikesCount    int64 `json:"likesCount,omitempty"`
  SharesCount   int64 `json:"sharesCount,omitempty"`
  Sentiment wapi.Sentiment `json:"sentiment,omitempty"`
  Language  wapi.Language  `json:"language,omitempty"`
  CreatedAt int64 `json:"createdAt"`
}
```
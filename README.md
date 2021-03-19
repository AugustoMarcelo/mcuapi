## 📖 Index
 - 📑 [About the project](#-about-the-project)
 - ➡ [Endpoints](#endpoints)
    - [List Movies](#list-movies)
    - [List a Movie](#list-a-movie)
    - [List TV Shows](#list-tvshows)
    - [List a TV Show](#list-a-tvshow)
 - ℹ [API considerations](#-api-considerations)

___

## 📑 About the project

A RESTFul API for MCU (Marvel Cinematic Universe)! Movies and TV Shows. Characters coming soon!
___

## ➡ Endpoints <a name="endpoints"></a>

> baseURL: https://mcuapi.herokuapp.com/api/v1

### [`GET` /movies{?page?limit?columns?order?filter}] <a name="list-movies"></a>
> List all movies
+ Parameters
  <table width="100%">
    <thead>
      <tr>
        <th>Parameter</th>
        <th>Description</th>
        <th>Parameter Type</th>
        <th>Usage</th>
        <th>Default Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>page</td>
        <td>Page number request</td>
        <td>Query (<i>optional</i>)</td>
        <td>page=1</td>
        <td>-</td>
      </tr>
      <tr>
        <td>limit</td>
        <td>Number of items by request</td>
        <td>Query (<i>optional</i>)</td>
        <td>limit=10</td>
        <td>-</td>
      </tr>
      <tr>
        <td>columns</td>
        <td>Movies attributes</td>
        <td>Query (<i>optional</i>)</td>
        <td>columns=title,release_date</td>
        <td>All attributes will be returned</td>
      </tr>
      <tr>
        <td>order</td>
        <td>Ordering by movies column</td>
        <td>Query (<i>optional</i>)</td>
        <td>order=chronology,DESC</td>
        <td>-</td>
      </tr>
      <tr>
        <td>filter</td>
        <td>Filtering by movies column</td>
        <td>Query (<i>optional</i>)</td>
        <td>filter=phase=1</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>

+ Response `200` (application/json)
  ```json
  {
    "total": 1,
    "data": [
      {
        "id": 1,
        "title": "Iron Man",
        "release_date": "2008-05-01",
        "box_office": 585171547,
        "duration": 126,
        "overview": "2008's Iron Man tells the story of Tony Stark, a billionaire industrialist and genius inventor who is kidnapped and forced to build a devastating weapon. Instead, using his intelligence and ingenuity, Tony builds a high-tech suit of armor and escapes captivity. When he uncovers a nefarious plot with global implications, he dons his powerful armor and vows to protect the world as Iron Man.",
        "cover_url": "https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/iron-man.jpg",
        "trailer_url": "http://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=5786306590001",
        "directed_by": "Jon Favreau",
        "phase": 1,
        "saga": "Infinity Saga",
        "chronology": 3,
        "post_credit_scenes": 1
      },
    ]
  }
  ```
---

### [`GET` /movies/{movie_id}] <a name="list-movies"></a>
> Show one movie
+ Parameters
  <table width="100%">
    <thead>
      <tr>
        <th>Parameter</th>
        <th>Description</th>
        <th>Parameter Type</th>
        <th>Default Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>movie_id</td>
        <td>Movie ID</td>
        <td>Path</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>

+ Response `200` (application/json)
  ```json
  {
    "id": 1,
    "title": "Iron Man",
    "release_date": "2008-05-01",
    "box_office": 585171547,
    "duration": 126,
    "overview": "2008's Iron Man tells the story of Tony Stark, a billionaire industrialist and genius inventor who is kidnapped and forced to build a devastating weapon. Instead, using his intelligence and ingenuity, Tony builds a high-tech suit of armor and escapes captivity. When he uncovers a nefarious plot with global implications, he dons his powerful armor and vows to protect the world as Iron Man.",
    "cover_url": "https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/iron-man.jpg",
    "directed_by": "Jon Favreau",
    "phase": 1,
    "saga": "Infinity Saga",
    "chronology": 3,
    "post_credit_scenes": 1
  }
  ```
___

### [`GET` /tvshows{?page?limit?columns?order?filter}] <a name="list-tvshows"></a>
> List all tv shows
+ Parameters
  <table width="100%">
    <thead>
      <tr>
        <th>Parameter</th>
        <th>Description</th>
        <th>Parameter Type</th>
        <th>Usage</th>
        <th>Default Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>page</td>
        <td>Page number request</td>
        <td>Query (<i>optional</i>)</td>
        <td>page=1</td>
        <td>-</td>
      </tr>
      <tr>
        <td>limit</td>
        <td>Number of items by request</td>
        <td>Query (<i>optional</i>)</td>
        <td>limit=10</td>
        <td>-</td>
      </tr>
      <tr>
        <td>columns</td>
        <td>TV Show attributes</td>
        <td>Query (<i>optional</i>)</td>
        <td>columns=title,release_date</td>
        <td>All attributes will be returned</td>
      </tr>
      <tr>
        <td>order</td>
        <td>Ordering by selected column</td>
        <td>Query (<i>optional</i>)</td>
        <td>order=release_date,DESC</td>
        <td>-</td>
      </tr>
      <tr>
        <td>filter</td>
        <td>Filtering by selected column and value</td>
        <td>Query (<i>optional</i>)</td>
        <td>filter=phase=1</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>

+ Response `200` (application/json)
  ```json
  {
    "total": 1,
    "data": [
      {
        "id": 1,
        "title": "WandaVision",
        "release_date": "2021-01-15",
        "last_aired_date": "2021-03-05",
        "number_seasons": 1,
        "number_episodes": 9,
        "overview": "Marvel Studios captivating new series 'WandaVision' which premieres in early 2021 on Disney+. Starring Elizabeth Olsen and Paul Bettany, 'WandaVision' marks the first series from Marvel Studios streaming exclusively on Disney+. The series is a blend of classic television and the Marvel Cinematic Universe in which Wanda Maximoff and Vision—two super-powered beings living idealized suburban lives—begin to suspect that everything is not as it seems",
        "cover_url": "https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/wandavision.jpg",
        "trailer_url": "https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215509803001",
        "directed_by": "Matt Shakman",
        "phase": 4,
        "saga": null,
      }
    ]
  }
  ```
---

### [`GET` /tvshows/{tvshow_id}] <a name="list-a-tvshow"></a>
> Show one tv show
+ Parameters
  <table width="100%">
    <thead>
      <tr>
        <th>Parameter</th>
        <th>Description</th>
        <th>Parameter Type</th>
        <th>Default Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>movie_id</td>
        <td>Movie ID</td>
        <td>Path</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>

+ Response `200` (application/json)
  ```json
  {
    "id": 1,
    "title": "WandaVision",
    "release_date": "2021-01-15",
    "last_aired_date": "2021-03-05",
    "number_seasons": 1,
    "number_episodes": 9,
    "overview": "Marvel Studios captivating new series 'WandaVision' which premieres in early 2021 on Disney+. Starring Elizabeth Olsen and Paul Bettany, 'WandaVision' marks the first series from Marvel Studios streaming exclusively on Disney+. The series is a blend of classic television and the Marvel Cinematic Universe in which Wanda Maximoff and Vision—two super-powered beings living idealized suburban lives—begin to suspect that everything is not as it seems",
    "cover_url": "https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/wandavision.jpg",
    "trailer_url": "https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215509803001",
    "directed_by": "Matt Shakman",
    "phase": 4,
    "saga": null,
  }
  ```

  + Response `404` (application/json)
  ```json
  {
    "status": "Error",
    "statusCode": 404,
    "message": "TV Show not found",
  }
  ```
___

## ℹ API considerations

**Chronological order followed:**

| Cronologic Order | Movie | Release Date |
|------------------|-------| ------------ |
| 1 | Captain America: First Avenger | 2011-07-22 |
| 2 | Captain Marvel | 2019-03-08 |
| 3 | Iron Man | 2008-05-02 |
| 4 | Iron Man II | 2010-05-07 |
| 5 | The Incredible Hulk | 2008-06-13 |
| 6 | Thor | 2011-05-06 |
| 7 | The Avengers | 2012-05-04 |
| 8 | Iron Man III | 2013-05-03 |
| 9 | Thor: The Dark World | 2013-11-08 |
| 10 | Captain America: The Winter Soldier | 2014-04-04 |
| 11 | Guardians of the Galaxy | 2014-08-01 |
| 12 | Guardians of the Galaxy Vol. II | 2017-05-05 |
| 13 | Avengers: Age of Ultron | 2015-05-01 |
| 14 | Ant-Man | 2015-07-17 |
| 15 | Captain America: Civil War | 2016-05-06 |
| 16 | Black Panter | 2018-02-16 |
| 17 | Spider-Man: Homecoming | 2017-10-17 |
| 18 | Doctor Strange | 2016-11-04 |
| 19 | Thor: Ragnarok | 2017-11-03 |
| 20 | Avengers: Infinity War | 2018-04-27 |
| 21 | Ant-Man and the Wasp | 2018-07-06 |
| 22 | Avengers: Endgame | 2019-04-26 |
| 23 | Spider-Man: Far From Home | 2019-07-02 |


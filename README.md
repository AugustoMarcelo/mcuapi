## 📖 Index
 - 📑 [About the project](#-about-the-project)
 - ➡ [Endpoints](#-endpoints)
 - ℹ [About the API](#-about-the-api)

___

## 📑 About the project

In development...
___

## ➡ Endpoints

### [`GET` /api/v1/movies{?page?limit}]
> List all movies
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
        <td>page</td>
        <td>Page number request</td>
        <td>Query (<i>optional</i>)</td>
        <td>-</td>
      </tr>
      <tr>
        <td>limit</td>
        <td>Number of items by request</td>
        <td>Query (<i>optional</i>)</td>
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
        "id": "2b88bf8b-3d6f-4944-bf96-2278acaca83f",
        "title": "Iron Man",
        "release_date": "2008-05-01T03:00:00.000Z",
        "box_office": 585171547,
        "duration": 126,
        "overview": "2008's Iron Man tells the story of Tony Stark, a billionaire industrialist and genius inventor who is kidnapped and forced to build a devastating weapon. Instead, using his intelligence and ingenuity, Tony builds a high-tech suit of armor and escapes captivity. When he uncovers a nefarious plot with global implications, he dons his powerful armor and vows to protect the world as Iron Man.",
        "cover_url": "https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/iron-man.jpg",
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

### [`GET` /api/v1/movies/{movie_id}]
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
        <td>Path (uuid format)</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>

+ Response `200` (application/json)
  ```json
  {
    "id": "2b88bf8b-3d6f-4944-bf96-2278acaca83f",
    "title": "Iron Man",
    "release_date": "2008-05-01T03:00:00.000Z",
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

## ℹ About the API

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


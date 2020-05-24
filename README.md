# About the project

In development...
___

# ➡ Endpoints

## [`GET` /api/v1/movies{?page?limit}]
> List all movies
+ Parameters
  | Parameter | Description | Parameter Type     | Default Value  |
  |-----------|-------------|--------------------|---------------|
  | page      | Page number request | Query (*optional*) | - |
  | limit     | Number of items by request | Query (*optional*) | - |

+ Response `200` (application/json)
  + Body
    ```json
    {
      "total": 1,
      "data": [
        {

        },
      ]
    }
    ```

## [`GET` /api/v1/movies/{movie_id}]
> Show one movie
+ Parameters
  | Parameter | Description | Parameter Type     | Default Value  |
  |-----------|-------------|--------------------|---------------|
  | movie_id  | Movie ID    | Path               | - |

+ Request (application/json)
  ```json
  {
    "movie_id": "uuid format"
  }
  ```

+ Response `200` (application/json)
  ```json
  {

  }
  ```
___

# About the API

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


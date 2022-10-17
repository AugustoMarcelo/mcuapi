## 📖 Index
 - 📑 [About the project](#about-the-project)
 - ➡ [Endpoint](#endpoint)
 - 🆕 [Next features](#next-features)
 - ❓ [How to run](#how-to-run)
 - 💥 [Changelogs](#changelogs)

___

## 📑 About the project <a name="about-the-project"></a>

A RESTFul API for MCU (Marvel Cinematic Universe)! Movies and TV Shows. Characters coming soon! See [the new documentation](https://mcuapi.herokuapp.com/docs)! If you have any suggestions, please open an issue!
___

## ➡ Endpoints <a name="endpoint"></a>

> baseURL: https://mcuapi.herokuapp.com/api/v1

> docs: https://mcuapi.herokuapp.com/docs
---

## 🆕 Next features <a name="next-features"></a>

  - 🔜 Characters information (you can see more details on [this issue](https://github.com/AugustoMarcelo/mcuapi/issues/13));
  - ⏳ An edit page where anyone can register, create/update the movies/tv-shows/characters' data and submit for final approval;
  - ⏳ A change in `cover_url` and `trailer_url` to get them as an array of covers and trailers;
  - ⏳ A new field for movies/tv-shows indicating the last time the information has been updated (you can see more details on [this issue](https://github.com/AugustoMarcelo/mcuapi/issues/14));
  - 🔜 A new field for movies/tv-shows indicating the streamings where they can be found (you can see more details on [this issue](https://github.com/AugustoMarcelo/mcuapi/issues/15)).

___

## ❓ How to run <a name="how-to-run"></a>

 - clone the project to your local:
 ```bash
  git clone https://github.com/AugustoMarcelo/mcuapi
 ```

> Running the project in development mode

  - create a `.env` file and put database and environment information. You can use the `.env.example` from the project;
  - inside the `.env` the *NODE_ENV* variable should be **development**. This tells the ormconfig where the files are located;
  - to configure the database structure and seeds, you should run the following commands:

  ```bash
    # creating tables
    yarn typeorm:dev migration:run

    # inserting data
    yarn seed:run:dev
  ```

  - run `yarn dev:server` to start the project and access it in the default 3333 port. You can also configure the port in the `.env` file.


---

> Running the project in production mode

  - create a `.env` file and put database and environment information. You can use the `.env.example` from the project;
  - inside the `.env` the *NODE_ENV* variable should be **production**. This tells the ormconfig where the built files are located;
  - to configure the database structure and seeds, you should run the following commands:

  ```bash
    # creating tables
    yarn typeorm migration:run

    # inserting data
    yarn seed:run
  ```

  - run `yarn build` or `npm run build` to generate the **./dist** folder. The ormconfig will point to this folder;
  - run `yarn start` or `npm run start` to start the project in the default 3333 port. You can also configure the port in the `.env` file.


---

## 💥 Changelogs <a name="changelogs"></a>
<details>
  <summary>2022-08-17: Movies | TV Shows updated</summary>

  - UPDATED
    - *Doctor Strange in the Multiverse of Madness: box_office*
    - *Thor: Love and Thunder: box_office*
    - *I Am Groot: cover_url, directed_by, saga*
    - *She-Hulk: Attorney at Law: cover_url, release_date*
</details>

<details>
  <summary>2022-07-25: Movies | TV Shows added/updated</summary>

  - ADDED
    - *Captain America: New World Order*
    - *Thunderbolts*
    - *Avengers: The Kang Dynasty*
    - *Avengers: Secret Wars*
    - *Daredevil: Born Again*

  - UPDATED
    - *Shang-Chi and The Legend of The Ten Rings: saga*
    - *Eternals: saga*
    - *Spider-Man: No Way Home: saga*
    - *Doctor Strange in the Multiverse of Madness: saga, box_office*
    - *Thor: Love and Thunder: saga, box_office*
    - *Black Panther: Wakanda Forever: overview, cover_url, trailer_url, saga, chronology*
    - *Ant-Man and The Wasp: Quantumania: overview, phase, saga, chronology*
    - *Guardians of the Galaxy Vol. 3: overview, phase, saga, chronology*
    - *The Marvels: phase, saga, chronology*
    - *Blade: release_date, phase, saga, chronology*
    - *Fantastic Four: release_date, phase, saga, chronology, directed_by*
    - *WandaVision: saga*
    - *The Falcon and The Winter Soldier: saga*
    - *Loki: saga*
    - *What If...?: saga*
    - *Hawkeye: saga*
    - *Moon Knight: saga*
    - *Ms. Marvel: saga*
    - *I Am Groot: overview, number_episodes, last_aired_date, saga*
    - *She-Hulk: title, trailer_url, saga*
    - *Secret Invasion: overview, phase, saga*
    - *Echo: phase, saga*
    - *Ironheart: phase, saga*
    - *Agatha: House of Harkness: title, phase, saga*
</details>

<details>
  <summary>2022-07-11: Movies | TV Shows added/updated</summary>

  - ADDED
    - *I Am Groot*
    - *Secret Invasion*
    - *Ironheart*
    - *Armor Wars*
    - *The Guardians of the Galaxy Holiday Special*
    - *Echo*
    - *Agatha: House of Harkness*

  - UPDATED
    - *She-Hulk: Attorney at Law: release_date*
    - *Doctor Strange in the Multiverse of Madness: updated box_office*
    - *Thor: Love and Thunder: updated duration, box_office and post_credit_scenes*
</details>

<details>
  <summary>2022-06-19: Movies updated</summary>

  - UPDATED
    - *Doctor Strange in the Multiverse of Madness: updated box_office*
    - *Shang-Chi: updated box_office*
    - *Spider-Man: No Way Home: updated box_office*
    - *Thor: Love and Thunder: updated duration*
</details>

<details>
  <summary>2022-05-17: Movies updated</summary>

  - UPDATED
    - *Doctor Strange in the Multiverse of Madness: updated box_office*
    - *Thor: Love and Thunder: updated trailer_url and cover_url*
</details>

<details>
  <summary>2022-05-17: Movies|TV Shows added/updated</summary>

  - ADDED
    - *She-Hulk: Attorney at Law*

  - UPDATED
    - *Doctor Strange in the Multiverse of Madness: updated box_office*
    - *Ms. Marvel: updated overview and last_aired_date*
</details>

<details>
  <summary>2022-05-04: Movies|TV Shows updated</summary>

  - UPDATED
    - *Ms. Marvel: updated overview and release_date*
    - *Moon Knight: updated last_aired_date and number_episodes*
    - *Doctor Strange in the Multiverse of Madness: updated post_credit_scenes*
</details>

<details>
  <summary>2022-05-01: Movies updated</summary>

  - UPDATED
    - *The Marvels: updated release_date*
    - *Ant-Man and The Wasp: Quantumania: update release_date*
    - *Thor: Love and Thunder: added overview*
</details>

<details>
  <summary>2022-04-18: Movies updated</summary>

  - UPDATED
    - *Spider-Man: No Way Home: updated box_office, chronology and related movies*
    - *Doctor Strange in the Multiverse of Madness: updated duration, chronology and related movies*
    - *Thor: Love and Thunder: updated cover, trailer_url, chronology and related movies*
</details>

<details>
  <summary>2022-03-16: TV Shows added/updated</summary>

  - ADDED
    - *Ms. Marvel*

  - UPDATED
    - *Moon Knight: updated cover_url*
</details>

<details>
  <summary>2022-02-20: Movies|TV Shows added/updated</summary>

  - UPDATED
    - *Doctor Strange in the Multiverse of Madness: updated cover and trailer_url*
    - *Spider-Man: No Way Home: updated box_office*
</details>

<details>
  <summary>2022-01-22: Movies|TV Shows added/updated</summary>

  - ADDED
    - *Moon Knight*

  - UPDATED
    - *Eternals: updated cover and box_office*
    - *Spider-Man: No Way Home: updated box_office*
    - *Shang-Chi: updated box_office*
</details>

<details>
  <summary>2022-01-06: Movies|TV Shows updated</summary>

  - UPDATED
    - *Black Panther: Wakanda Forever: updated cover*
    - *Doctor Strange in the Multiverse of Madness: updated cover*
    - *Hawkeye: updated cover*
</details>

<details>
  <summary>2021-12-28: Movies|TV Shows updated</summary>

  - UPDATED
    - *Spider-Man: No Way Home: updated box_office, duration, cover, trailer_url and post_credit_scenes*
    - *Eternals: updated box_office*
    - *Shang-Chi: updated box_office*
    - *Black Widow: updated box_office*
    - *Spider-Man: Far From Home: updated box_office*
    - *Doctor Strange in the Multiverse of Madness: updated trailer_url*
    - *Hawkeye: updated cover and last_aired_episode*
</details>

<details>
  <summary>2021-11-13: Movies updated</summary>

  - UPDATED
    - *Spider-Man: No Way Home: updated cover*
</details>

<details>
  <summary>2021-11-06: Movies updated</summary>

  - UPDATED
    - *Eternals: updated duration and post_credit_scenes*
    - *Doctor Strange in the Multiverse of Madness: update release_date*
    - *Thor: Love and Thunder: update release_date*
    - *Black Panther: Wakanda Forever: update release_date*
    - *The Marvels: update release_date*
    - *Ant-Man and The Wasp: Quantumania: update release_date*
</details>

<details>
  <summary>2021-09-19: TV Shows updated</summary>

  - ADDED
    - *What If...?*
    - *Hawkeye*
</details>

<details>
  <summary>2021-08-28: Movies updated</summary>

  - UPDATED
    - *Spider-Man: No Way Home: updated overview, trailer_url and related_movies*
</details>

<details>
  <summary>2021-08-21: Movies updated</summary>

  - UPDATED
    - *Shang-Chi: updated cover, title, duration and post_credit_scenes*
    - *The Avengers: updated box_office*
    - *Guardians of the Galaxy: updated box_office*
    - *Guardians of the Galaxy Vol. 2: updated box_office*
    - *Avengers: Age of Ultron: updated box_office*
    - *Captain America: Civil War: updated box_office*
    - *Doctor Strange: updated box_office*
    - *Thor: Ragnarok: updated box_office*
    - *Black Panther: updated box_office*
    - *Avengers: Infinity War: updated box_office*
    - *Captain Marvel: updated box_office*
    - *Avengers: Endgame: updated box_office*
    - *Spider-Man: Far From Home: updated box_office*
    - *Black Widow: updated box_office*
    - *Eternals: updated trailer_url*
</details>

<details>
  <summary>2021-07-31: Movies updated</summary>

   - UPDATED
    - *Black Panther: updated chronology*
    - *Avengers: Infinity War: updated chronology*
    - *Ant-Man and The Wasp: updated chronology*
    - *Black Widow: updated chronology*
    - *Shang-Chi: updated cover*
    - *Added a property `related_movies` to movies/{id} endpoint that returns all related movies*
</details>

<details>
  <summary>2021-07-14: Movies|TV Shows updated</summary>

  - UPDATED
    - *Loki: updated last_aired_date*
    - *Black Widow: updated chronology*
</details>

<details>
  <summary>2021-07-04: Movies|TV Shows updated</summary>

  - UPDATED
    - *All movies and tv shows: added imdb_id property*
    - *Black Widow: updated cover*
</details>

<details>
  <summary>2021-06-12: Movies updated</summary>

  - UPDATED
    - *The Marvels: updated cover*
</details>

<details>
  <summary>2021-05-24: Movies|TV Shows updated</summary>

  - UPDATED
    - *The Eternals: updated title, overview, cover and trailer_url*
    - *Loki: updated cover*
</details>

<details>
  <summary>2021-05-04: Movies|TV Shows updated</summary>

  - UPDATED
    - *Captain Marvel 2: updated title*
    - *Black Panther 2: updated title and overview*
    - *Ant-Man and The Wasp: Quantumania: updated release_date*
    - *Loki: updated overview, cover_url and release_date*
  - ADDED
    - *Guardians of the Galaxy Vol .3*
</details>

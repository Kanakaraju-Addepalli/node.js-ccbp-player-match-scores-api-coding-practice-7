const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// API 1 Returns a list of all the players in the player table

app.get("/players/", async (request, response) => {
  const playerDetails = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName
        FROM
            player_details;`;
  const playersArray = await db.all(playerDetails);
  response.send(playersArray);
});

// API 2 Returns a specific player based on the player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName
        FROM
            player_details
        WHERE
            player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  response.send(player);
});

// API 3 Updates the details of a specific player based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `
        UPDATE
            player_details
        SET
            player_name = "${playerName}"
        WHERE 
            player_id = ${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

// API 4 Returns the match details of a specific match

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
        SELECT
            match_id AS matchId,
            match,
            year
        FROM
            match_details
        WHERE
            match_id = ${matchId};`;
  const matchDetails = await db.get(getMatchDetails);
  response.send(matchDetails);
});

// API 5 Returns a list of all the matches of a player

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchesOfAPlayer = `
        SELECT
            DISTINCT match_id AS matchId,
            match,
            year
        FROM
            player_match_score NATURAL JOIN match_details
        WHERE 
            player_id = ${playerId};`;
  const arrayOfGetMatchesOfAPlayer = await db.all(getMatchesOfAPlayer);
  response.send(arrayOfGetMatchesOfAPlayer);
});

// API 6 Returns a list of players of a specific match

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersListInAMatchQuery = `
        SELECT
            DISTINCT player_id AS playerId,
            player_name AS playerName
        FROM
            player_match_score NATURAL JOIN player_details
        WHERE 
            match_id = ${matchId};`;
  const arrayOfGetPlayersListInAMatchQuery = await db.all(
    getPlayersListInAMatchQuery
  );
  response.send(arrayOfGetPlayersListInAMatchQuery);
});

// API 7 Returns the statistics of the total score, fours, sixes of a specific player based on the player ID

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const statisticsOfAPlayer = `
        SELECT
            DISTINCT player_match_id AS playerId,  
            player_name AS playerName,
            sum(score) AS totalScore,
            sum(fours) AS totalFours,
            sum(sixes) AS totalSixes
        FROM
            player_match_score NATURAL JOIN player_details
        WHERE 
            player_id = ${playerId};`;
  const arrayOfStatisticsOfAPlayer = await db.get(statisticsOfAPlayer);
  response.send(arrayOfStatisticsOfAPlayer);
});

module.exports = app;

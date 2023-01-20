const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());

let db = null;

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT
          *
        FROM
          cricket_team
        ORDER BY
          player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO
            cricket_team (playerName, jerseyNumber, role)
        VALUES
            (
                '${playerName}',
                '${jerseyNumber}',
                '${role}'
            );`;

  const dbResponse = await db.run(addPlayerQuery);
  const player_id = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:player_id/", async (request, response) => {
  const { player_id } = request.params;
  const getPlayersQuery = `
    SELECT
      * 
    FROM 
      cricket_team 
    WHERE 
      player_id = ${player_id};`;
  const player = await db.get(getPlayersQuery);
  response.send(player);
});

app.put("/players/:player_id/", async (request, response) => {
  const { player_id } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      playerName = '${playerName}',
      jerseyNumber = '${jerseyNumber}',
      role = '${role}'
    WHERE
      player_id = ${player_id}`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:player_id/", async (request, response) => {
  const { player_id } = request.params;
  const deletePlayerQuery = `DELETE FROM
      cricket_team
    WHERE 
      player_id = ${player_id};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app.js;

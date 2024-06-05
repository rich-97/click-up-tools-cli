#!/usr/bin/env node

const axios = require("axios");
const moment = require("moment");
require("dotenv").config();

const CLICKUP_API_URL =
  "https://api.clickup.com/api/v2/team/{team_id}/time_entries";
const API_KEY = process.env.CLICKUP_API_KEY; // Tu API key de ClickUp

const userEmail = process.argv[2]; // Email del usuario pasado como argumento de línea de comandos
const teamId = "3045042"; // Reemplaza con el ID de tu equipo

if (!userEmail) {
  console.error("Please provide a user email as an argument.");
  process.exit(1);
}

async function getHoursForUser(email) {
  try {
    const response = await axios.get(
      CLICKUP_API_URL.replace("{team_id}", teamId),
      {
        headers: {
          Authorization: API_KEY,
        },
      }
    );

    const timeEntries = response.data.data;
    const today = moment().startOf("day");
    const userEntries = timeEntries.filter(
      (entry) => entry.user.email === email
    );
    const todayEntries = userEntries.filter((entry) => {
      const startTime = moment(parseInt(entry.start));
      return startTime.isSame(today, "day");
    });

    const totalDuration = todayEntries.reduce(
      (total, entry) => total + parseInt(entry.duration),
      0
    );
    const totalHours = totalDuration / (1000 * 60 * 60); // Convertir milisegundos a horas

    return totalHours;
  } catch (error) {
    console.error("Error retrieving time entries:", error);
    process.exit(1);
  }
}

getHoursForUser(userEmail).then((hours) => {
  console.log(
    `Total hours worked today by ${userEmail}: ${hours.toFixed(2)} hours`
  );
});

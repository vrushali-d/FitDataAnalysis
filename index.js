#! /usr/bin/env node
import fs from "node:fs";
import readline from "node:readline";
import { printCalendar } from "./calendar.js";
import select, { Separator } from "@inquirer/select";
import { exit } from "node:process";

const months = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

let choices = [];
for (let m in months) {
  let option = {
    name: m.toLocaleUpperCase(),
    value: m,
  };
  choices.push(option);
}

const answer = await select({
  message: "Select a month",
  choices: choices,
  default:new Date().toLocaleString("default", {
    month: "long",
  }).toLowerCase()
});

let args = process.argv;
//console.log(args);
let activityData = undefined;
if (args.length > 2) {
  activityData = args[2];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const dataDir = "./All Sessions";
let files = fs.readdirSync(dataDir);
let dailyActivities = [];
for (let file of files) {
  try {
    const data = fs.readFileSync(`${dataDir}/${file}`, "utf8");
    let obj = JSON.parse(data);
    let currDate = obj.startTime.split("T")[0];
    let dateTokens = currDate.split("-");
    dateTokens[1] -= 1;
    currDate = dateTokens.join("-");

    let activity = {
      fitnessActivity: obj.fitnessActivity,
      date: new Date(currDate),
    };

    for (let matric of obj.aggregate) {
      let matricName = matric.metricName.split(".")[2];
      if (matricName == "active_minutes") {
        activity.duration = matric.intValue;
      }
      if (matricName == "step_count") {
        activity.stepCount = matric.intValue;
      }
    }
    dailyActivities.push(activity);
  } catch (err) {
    console.error(err);
  }
}
function daysInMonth(month, year) {
  // Month in JavaScript is 0-indexed (January is 0, February is 1, etc).
  // By using 0 as the day, we get the last day of the prior month.
  return new Date(year, month, 0).getDate();
}

let month = answer.toLowerCase();
let lastDate = daysInMonth(months[month] + 1, 2024);
let inactiveDays = 0;
let activeDays = [];
for (let i = 1; i <= lastDate; i++) {
  let everyDay = new Date(`2024-${months[month]}-${i}`);
  //console.log(everyDay.toLocaleDateString()+"\n");
  let isActivityDone = false;
  for (
    let activityIndex = 0;
    activityIndex < dailyActivities.length;
    ++activityIndex
  ) {
    if (
      dailyActivities[activityIndex].date.toLocaleDateString() ===
        everyDay.toLocaleDateString() &&
      activityData != undefined &&
      dailyActivities[activityIndex].fitnessActivity === activityData
    ) {
      //console.log(dailyActivities[activityIndex]);
      activeDays.push(i);
      isActivityDone = true;
    }
  }
  if (!isActivityDone) {
    //console.log('No Activity on this day');
    inactiveDays += 1;
  }
}
console.log(`Summary:
    You were only active for ${
      lastDate - inactiveDays
    } days from total of ${lastDate} in month of ${month}`);
printCalendar(2024, months[month] + 1, activeDays);

exit(0);

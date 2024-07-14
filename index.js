#! /usr/bin/env node
import fs from "node:fs";
import { exit } from "node:process";
import select from "@inquirer/select";
import confirm from "@inquirer/confirm";
import { printCalendar } from "./calendar.js";
import { months } from "./calendar.js";
import { daysInMonth } from "./calendar.js";

let uniqueActivities = new Set();

// Read the google fit json data from folder
const dataDir = "./All Sessions";
let files = fs.readdirSync(dataDir);
let dailyActivities = [];
for (let file of files) {
  try {
    const data = fs.readFileSync(`${dataDir}/${file}`, "utf8");
    let obj = JSON.parse(data);
    uniqueActivities.add(obj.fitnessActivity);
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

let monthChoices = [];
for (let m in months) {
  let option = {
    name: m.toLocaleUpperCase(),
    value: m,
  };
  monthChoices.push(option);
}

let activityChoices = [];
for(const item of uniqueActivities){
  let option = {
    name: item.toLocaleUpperCase(),
    value: item,
  };
  activityChoices.push(option);  
}

let isContinue = true;
while (isContinue) {
  const answer = await select({
    message: "Select a month",
    choices: monthChoices,
    default: new Date()
      .toLocaleString("default", {
        month: "long",
      })
      .toLowerCase(),
  });
  const activityData = await select({
    message: "Select a activity",
    choices: activityChoices,
    default: 'walking',
  });

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
  isContinue = await confirm({ message: "Continue?" });
}
exit(0);

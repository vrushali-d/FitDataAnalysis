import chalk from "chalk";

export function daysInMonth(month, year) {
  // Month in JavaScript is 0-indexed (January is 0, February is 1, etc).
  // By using 0 as the day, we get the last day of the prior month.
  return new Date(year, month, 0).getDate();
}

export const months = {
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

export function printCalendar(year, month, highlightDays) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  });

  console.log(`Calendar for ${monthName} ${year}:`);

  // Print day headers (Sun, Mon, Tue, etc.)
  console.log("Su Mo Tu We Th Fr Sa");

  // Calculate the day of the week for the first day of the month
  const firstDay = new Date(year, month - 1, 1).getDay();

  // Print leading spaces for days before the first day
  process.stdout.write("   ".repeat(firstDay));

  // Print days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    if (highlightDays.includes(day)) {
      // Highlight the specified day (red foreground, yellow background)
      process.stdout.write(
        chalk.bgGreen(`${day.toString().padStart(2, " ")} `)
      );
    } else {
      process.stdout.write(day.toString().padStart(2, " ") + " ");
    }

    // Break lines for new weeks (Sunday)
    if ((firstDay + day) % 7 === 0) {
      console.log();
    }
  }

  console.log(); // Add a newline at the end
}

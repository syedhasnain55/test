import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/live-matches", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.goto("https://www.espncricinfo.com/live-cricket-score", {
      waitUntil: "networkidle2",
    });

    const matches = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".ds-flex"))
        .map(el => ({
          team1: el.querySelector(".ds-text-title-s")?.innerText || "Unknown",
          team2: el.querySelectorAll(".ds-text-title-s")[1]?.innerText || "Unknown",
          status: el.querySelector(".ds-text-compact-xs")?.innerText || "No Status",
        }))
        .slice(0, 5);
    });

    await browser.close();
    res.json({ matches });

  } catch (error) {
    res.status(500).json({ error: "Scraping failed", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

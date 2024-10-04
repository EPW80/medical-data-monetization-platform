import express, { Request, Response } from "express";

const app = express();
const port = 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Medical Data Monetization API is running");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

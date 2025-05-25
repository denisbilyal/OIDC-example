import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Test route is working!");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { notFoundMiddleware } = require("./middlewares/not-found");
const authRouter = require("./routes/auth-router");
const { errorMiddleware } = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);


app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT_BACK_END || 8000;
app.listen(port, () => console.log("Running server", port));

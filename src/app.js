require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { notFoundMiddleware } = require("./middlewares/not-found");
const authRouter = require("./routes/auth-router");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const { authenticate } = require("./middlewares/authenticate");
const userRouter = require("./routes/user-router");
const { isAdmin } = require("./middlewares/isAdmin");
const adminRouter = require("./routes/admin-router");
const limiter = require("./middlewares/rate-limit");

const app = express();

app.use(cors());
app.use(limiter);
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", authenticate, userRouter);
app.use("/admin", authenticate,isAdmin,adminRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT_BACK_END || 8000;
app.listen(port, () => console.log("Running server", port));

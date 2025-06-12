const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");

const {
  configureWinGoSockets,
} = require("./controllers/games/winGo.controller");
const {
  configureTrxWinGoSockets,
} = require("./controllers/games/trxWinGo.controller");
const {
  configureCarRaceSockets,
} = require("./controllers/games/racing.controller");
const configureK3Sockets = require("./controllers/games/k3.controller");
const {
  configureFiveDSockets,
} = require("./controllers/games/fiveD.controller");

const adminSocket = require("./sockets/support/adminSocket");
const userSocket = require("./sockets/support/userSocket");

dotenv.config();
// console.log(
//   "🕒 Server timezone:",
//   Intl.DateTimeFormat().resolvedOptions().timeZone
// );
// console.log("🕓 Current server time:", new Date().toString());
// console.log("🕔 Current UTC time:", new Date().toUTCString());
connectDB();

const app = express();
// Trust the first proxy in front of this app (like Nginx or Heroku)
// app.set("trust proxy", true);
// ✅ SAFE: Set trust proxy only in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy (like Nginx or Vercel)
} else {
  app.set("trust proxy", false); // development: don't trust proxy headers
}

const server = http.createServer(app);

// const allowOrigins = process.env.CLIENT_URL;
const allowOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((origin) => origin.trim())
  : [];

const io = socketIo(server, {
  cors: {
    origin: allowOrigins, // Allow multiple frontend origins
    // methods: ["GET", "POST"],
    credentials: true,
  },
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
// Static folder for uploaded files (optional if you keep them)
// app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send(
    `<h3>TCVVIP Clone Server running in ${process.env.NODE_ENV} mode</h3>`
  );
});

app.use("/api/v1/auth", require("./routes/authUser.routes"));
app.use("/api/v1/admin", require("./routes/admin.routes"));
app.use("/api/v1/user", require("./routes/user.routes"));
app.use("/api/v1", require("./routes/userActivities.routes"));
app.use("/api/v1/rewards", require("./routes/rewards.routes"));
app.use("/api/v1/feedbacks", require("./routes/feedbacks.routes"));
app.use("/api/v1/transaction", require("./routes/transactions.routes"));
app.use("/api/v1/finance", require("./routes/userFinance.routes"));
app.use("/api/v1/punishment", require("./routes/punishment.routes"));
app.use("/api/v1/attendance", require("./routes/attendance.routes"));
app.use(
  "/api/v1/payment-methods/deposit",
  require("./routes/depositPaymentMethod.routes")
);
app.use(
  "/api/v1/payment-methods/withdraw",
  require("./routes/withdrawalPaymentMethod.routes")
);
app.use("/api/v1/agent", require("./routes/parentChild.routes"));
app.use("/api/v1/revenue", require("./routes/revenue.routes"));
app.use("/api/v1/bets", require("./routes/bet.routes"));
app.use("/api/v1/announcement", require("./routes/announcements.routes"));

// Games Routes
app.use("/api/v1/game/wingo", require("./routes/games/winGo.routes"));
app.use("/api/v1/game/trxwingo", require("./routes/games/trxWinGo.routes"));
app.use("/api/v1/game/racing", require("./routes/games/racing.routes"));
app.use("/api/v1/game/k3", require("./routes/games/k3.routes"));
app.use("/api/v1/game/five-d", require("./routes/games/fiveD.routes"));
configureWinGoSockets(io);
configureTrxWinGoSockets(io);
configureCarRaceSockets(io);
configureK3Sockets(io);
configureFiveDSockets(io);

// support socket
adminSocket(io);
userSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
);

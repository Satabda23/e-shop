const Config = {
  HOST: process.env.DB_HOST || "localhost",
   PORT: process.env.DB_PORT || "3306",
  DATABASE: process.env.DB_NAME || "",
  USER: process.env.DB_USER || "",
  PASSWORD: process.env.DB_PASSWORD || "",
  dialect: "mysql",
  charset: "utf8",
  collate: "utf8_general_ci",
  pool: {
    max: 25,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  timezone: "+05:30",
};
export default Config;

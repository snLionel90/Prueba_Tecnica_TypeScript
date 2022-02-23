const express = require("express")
const dotenv = require('dotenv')
const radarRouter = require('./routes/radar')
const getIntro = require("./routes/intro")

const app = express()
dotenv.config()
const PORT = process.env.PORT
//middlewares
app.use(express.json())

//routes
app.use("/radar", radarRouter)
app.use("/", getIntro)
app.listen(PORT || 8801, () => {
  console.log(`Listen on port ${PORT || 8801}`)
})
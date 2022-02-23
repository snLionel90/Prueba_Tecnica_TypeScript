const fs = require("fs")
const router = require("express").Router()

router.get("/", async (req, res) => {
  try {
    fs.readFile("./readme.md", "utf-8", (err, data) => {
      if(err) console.log(err)
      else {
        res.status(200).send(data)
      }
    })
    
  } catch (err) {
    res.status(500).json({ message: err, success: false});
  }
})

module.exports = router
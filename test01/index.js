require('dotenv').config()

const express = require('express')
const app = express()
const PORT = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/login', (req, res) => {
    res.send('<h1>I am login</h1>')
})

app.get('/logout', (req, res) => {
    res.send('<h1>I am logout</h1>')
})

app.get('/signin', (req, res) => {
    res.send('<h1>I am signin</h1>')
})

app.get('/singup', (req, res) => {
    res.send('<h1>I am signup</h1>')
})

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})

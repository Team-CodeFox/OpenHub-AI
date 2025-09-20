import express from 'express'

const app = express()

app.get('/test', (req, res) => {
  res.json({ message: 'Test server working!' })
})

app.get('/api/flowchart/simple', (req, res) => {
  res.json({ message: 'Flowchart test works!' })
})

const PORT = 5002
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`)
})

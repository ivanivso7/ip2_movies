const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mysql = require('mysql2')
const axios = require('axios')

const app = express()
const PORT = 3000

app.use(cors())
app.use(bodyParser.json())

// 🔥 STAVI SVOJ OMDb API KEY
const OMDB_API_KEY = '3db648d6'

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'moviehub'
})

db.connect(err => {
  if (err) throw err
  console.log('Connected to MySQL!')
})

/* -------------------- MOVIES (MYSQL) -------------------- */

// GET /movies?page=&limit=&search=&genre=
app.get('/movies', (req, res) => {
  let { search, genre, page, limit } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 6
  const offset = (page - 1) * limit

  let where = 'WHERE 1=1'
  const params = []

  if (search) {
    where += ' AND title LIKE ?'
    params.push(`%${search}%`)
  }

  if (genre) {
    where += ' AND genre = ?'
    params.push(genre)
  }

  const sqlCount = `SELECT COUNT(*) AS total FROM movies ${where}`
  const sqlData = `SELECT * FROM movies ${where} LIMIT ? OFFSET ?`

  db.query(sqlCount, params, (err, countResult) => {
    if (err) return res.status(500).send(err)
    const total = countResult[0].total

    db.query(sqlData, [...params, limit, offset], (err2, results) => {
      if (err2) return res.status(500).send(err2)
      res.json({ movies: results, total })
    })
  })
})

// GET /movies/:id
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  db.query('SELECT * FROM movies WHERE id=?', [id], (err, results) => {
    if (err) return res.status(500).send(err)
    if (!results.length) return res.status(404).json({ message: 'Movie not found' })
    res.json(results[0])
  })
})

// POST /movies
app.post('/movies', (req, res) => {
  const { title, genre, year, rating, description } = req.body
  db.query(
    'INSERT INTO movies (title, genre, year, rating, description) VALUES (?, ?, ?, ?, ?)',
    [title, genre, year, rating, description || null],

    (err, result) => {
      if (err) return res.status(500).send(err)
      res.json({ id: result.insertId, ...req.body })
    }
  )
})

// PUT /movies/:id
app.put('/movies/:id', (req, res) => {
  const { id } = req.params
  const { title, genre, year, rating, description } = req.body
  db.query(
    'UPDATE movies SET title=?, genre=?, year=?, rating=?, description=? WHERE id=?',
    [title, genre, year, rating, description || null, id],

    (err) => {
      if (err) return res.status(500).send(err)
      res.json({ id, ...req.body })
    }
  )
})

// DELETE /movies/:id
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  db.query('DELETE FROM movies WHERE id=?', [id], (err) => {
    if (err) return res.status(500).send(err)
    res.json({ message: 'Movie deleted' })
  })
})

/* -------------------- OMDB (PUBLIC API) -------------------- */


// GET /omdb/search?query=...
app.get('/omdb/search', async (req, res) => {
  try {
    const query = req.query.query
    if (!query) return res.status(400).json({ error: 'Missing query' })

    const r = await axios.get('http://www.omdbapi.com/', {
      params: { s: query, apikey: OMDB_API_KEY }
    })

    if (r.data.Response === 'False') {
      return res.json({ results: [], message: r.data.Error })
    }

    res.json({ results: r.data.Search })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

//novo dodano!!!
app.get('/genres', (req, res) => {
  db.query(
    'SELECT DISTINCT genre FROM movies WHERE genre IS NOT NULL AND genre <> "" ORDER BY genre',
    (err, results) => {
      if (err) return res.status(500).send(err)
      res.json(results.map(r => r.genre))
    }
  )
})

// POST /omdb/add  { imdbID: "tt..." }
app.post('/omdb/add', async (req, res) => {
  try {
    const { imdbID } = req.body
    if (!imdbID) return res.status(400).json({ error: 'Missing imdbID' })

    // fetch details
    const r = await axios.get('http://www.omdbapi.com/', {
      params: { i: imdbID, apikey: OMDB_API_KEY }
    })

    if (r.data.Response === 'False') {
      return res.status(400).json({ error: r.data.Error })
    }

    const data = r.data
    const title = data.Title
    const genre = data.Genre ? data.Genre.split(',')[0].trim() : 'Unknown'
    const year = parseInt(data.Year) || 2000
    const rating = parseFloat(data.imdbRating) || 0

    // check if exists already
    db.query(
      'SELECT id FROM movies WHERE title=? AND year=? LIMIT 1',
      [title, year],
      (err, exists) => {
        if (err) return res.status(500).send(err)

        if (exists.length > 0) {
          return res.json({ message: 'Already exists', id: exists[0].id })
        }

        // insert
        db.query(
          'INSERT INTO movies (title, genre, year, rating) VALUES (?, ?, ?, ?)',
          [title, genre, year, rating],
          (err2, result) => {
            if (err2) return res.status(500).send(err2)
            res.json({ message: 'Added', id: result.insertId })
          }
        )
      }
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/omdb/details', async (req, res) => {
  try {
    const { title, year } = req.query

    const r = await axios.get('http://www.omdbapi.com/', {
      params: {
        t: title,
        y: year,
        apikey: OMDB_API_KEY
      }
    })

    if (r.data.Response === 'False') {
      return res.json({ plot: '' })
    }

    res.json({ plot: r.data.Plot || '' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

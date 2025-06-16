require('dotenv').config()
const express = require('express')
const Person = require('./models/person')

const app = express()

//const password = process.argv[2]
//const url =
//`mongodb+srv://vee-p:${password}@cluster0.nznc4ci.mongodb.net/puhelinluetteloApp?retryWrites=true&w=majority&appName=Cluster0`

app.use(express.static('dist'))
app.use(express.json())
//app.use(requestLogger)

const morgan = require('morgan')
app.use(morgan('tiny'))
morgan.token('body', (request) => {
  return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

//let persons = [
//    {id: "1", name: "Arto Hellas", number: "040-123456"},
//    {id: "2", name: "Ada Lovelace", number: "39-44-5323523"},
//    {id: "3", name: "Dan Abramov", number: "12-43-234345"},
//    {id: "4", name: "Mary Poppendieck", number: "39-23-6423122"}
//]

app.get('/', (request, response) => {
  response.send('<h1>Puhelinluettelo</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    const numberOfPersons = persons.length
    const date = new Date()
    response.send(`
                <p>Phonebook has info for ${numberOfPersons} people</p>
                <p>${date}</p>`)
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

//const generateNewId = () => {
//    const newId = Math.floor(Math.random() * (1000))
//    return newId.toString()
//}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)
  if (!body.name && !body.number) {
    return response.status(400).json({ error: 'name and number missing' })
  } else if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  } else if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  } else {
    const person = new Person({
      name: body.name,
      number: body.number
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
      .catch(error => next(error))
  }
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


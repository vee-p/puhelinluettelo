const express = require('express')
const app = express()

app.use(express.json())

const cors = require('cors')
app.use(cors())

const morgan = require('morgan')
app.use(morgan('tiny'))
morgan.token('body', (request) => {
    return JSON.stringify(request.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Puhelinluettelo</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const numberOfPersons = persons.length
    const date = new Date()

    response.send(`
        <p>Phonebook has info for ${numberOfPersons} people</p>
        <p>${date}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

const generateNewId = () => {
    const newId = Math.floor(Math.random() * (1000))
    return newId.toString()
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    const names = persons.map((person) => person.name)
    const checkName = names.includes(body.name)
    console.log(names)
    console.log(`löytyykö: ${checkName} haettava: ${body.name}`)

    if (!body.name && !body.number) {
        return response.status(400).json({
            error: 'name and number missing'
        })
    } else if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    } else if (checkName) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    } else {
        const person = {
            id: generateNewId(),
            name: body.name,
            number: body.number,
        }
    persons = persons.concat(person)
    response.json(person)
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})


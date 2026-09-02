---
mainImage: ../../../images/part-8.svg
par
t: 8
letter: e
lang: en
---
<div class="conte
nt">

We are approaching the end of this part
. Let's finish by having a look at a few more
 details about GraphQL.

### Fragments

It is
 pretty common in GraphQL that multiple queri
es return similar results. For example, the q
uery for the details of a person

```js
query
 {
  findPerson(name: "Pekka Mikkola") {
    
name
    phone
    address{
      street 
   
   city
    }
  }
}
```

and the query for al
l persons

```js
query {
  allPersons {
    n
ame
    phone
    address{
      street 
    
  city
    }
  }
}
```

both return persons. 
When choosing the fields to return, both quer
ies have to define exactly the same fields.


Such situations can be simplified by using [f
ragments](https://graphql.org/learn/queries/#
fragments). A fragment that selects all of a 
person’s details looks like this:

```js
fr
agment PersonDetails on Person {
  name
  pho
ne 
  address {
    street 
    city
  }
}
``
`

With the fragment, we can do the queries i
n a compact form:

```js
query {
  allPersons
 {
    ...PersonDetails // highlight-line
  }

}

query {
  findPerson(name: "Pekka Mikkola
") {
    ...PersonDetails // highlight-line
 
 }
}
```

The fragments <i><strong>are not</s
trong></i> defined in the GraphQL schema, but
 in the client. The fragments must be declare
d when the client uses them for queries.

In 
principle, we could declare the fragment with
 each query like so:

```js
export const FIND
_PERSON = gql`
  query findPersonByName($name
ToSearch: String!) {
    findPerson(name: $na
meToSearch) {
      ...PersonDetails
    }
  
}

  fragment PersonDetails on Person {
    i
d
    name
    phone
    address {
      stre
et 
      city
    }
  }
`
```

However, it i
s much more sensible to define the fragment o
nce and store it in a variable. Let’s add t
he fragment definition to the beginning of th
e <i>queries.js</i> file:

```js
const PERSON
_DETAILS = gql`
  fragment PersonDetails on P
erson {
    id
    name
    phone 
    addres
s {
      street 
      city
    }
  }
`
```


The fragment can now be embedded into all qu
eries and mutations that need it using the [d
ollar curly braces](https://developer.mozilla
.org/en-US/docs/Web/JavaScript/Reference/Temp
late_literals) operation:

```js
export const
 FIND_PERSON = gql`
  query findPersonByName(
$nameToSearch: String!) {
    findPerson(name
: $nameToSearch) {
      ...PersonDetails
   
 }
  }

  ${PERSON_DETAILS}
`
```

So the tem
plate literal in the *PERSON_DETAILS* variabl
e is now inserted as part of the *FIND_PERSON
* template literal. In practice, the end resu
lt is exactly the same as in the earlier exam
ple, where the fragment was defined directly 
alongside the query.

### Subscriptions
  
Al
ong with query and mutation types, GraphQL of
fers a third operation type: [subscriptions](
https://www.apollographql.com/docs/react/data
/subscriptions/). With subscriptions, clients
 can <i>subscribe</i> to updates about change
s in the server.

Subscriptions are radically
 different from anything we have seen in this
 course so far. Until now, all interaction be
tween browser and server was due to a React a
pplication in the browser making HTTP request
s to the server. GraphQL queries and mutation
s have also been done this way.
With subscrip
tions, the situation is the opposite. After a
n application has made a subscription, it sta
rts to listen to the server.
When changes occ
ur on the server, it sends a notification to 
all of its <i>subscribers</i>.

Technically s
peaking, the HTTP protocol is not well-suited
 for communication from the server to the bro
wser. So, under the hood, Apollo uses [WebSoc
kets](https://developer.mozilla.org/en-US/doc
s/Web/API/WebSockets_API) for server subscrib
er communication.

### expressMiddleware

Sta
rting from version 3.0, Apollo Server no long
er provides direct support for subscriptions.
 We therefore need to make a number of change
s to the backend code in order to get subscri
ptions working.


So far, we have started the
 application with the easy-to-use function [s
tartStandaloneServer](https://www.apollograph
ql.com/docs/apollo-server/api/standalone/#sta
rtstandaloneserver), thanks to which the appl
ication has not had to be configured that muc
h:

```js
const { startStandaloneServer } = r
equire('@apollo/server/standalone')

// ...


const startServer = (port) => {
  const serve
r = new ApolloServer({
    typeDefs,
    reso
lvers,
  })

  startStandaloneServer(server, 
{
    listen: { port },
    context: async ({
 req }) => {
      // ...
    },
  }).then(({
 url }) => {
    console.log(`Server ready at
 ${url}`)
  })
}
```

Unfortunately, startSta
ndaloneServer does not allow adding subscript
ions to the application, so let's switch to t
he more robust [expressMiddleware](https://ww
w.apollographql.com/docs/apollo-server/api/ex
press-middleware/) function. As the name of t
he function already suggests, it is an Expres
s middleware, which means that Express must a
lso be configured for the application, with t
he GraphQL server acting as middleware.

Let�
��s install Express and the Apollo Server int
egration package:

```bash
npm install expres
s cors @as-integrations/express5
```

and cha
nge the <i>server.js</i> file to the followin
g form:

```js
const { ApolloServer } = requi
re('@apollo/server')
// highlight-start
const
 {
  ApolloServerPluginDrainHttpServer,
} = r
equire('@apollo/server/plugin/drainHttpServer
')
const { expressMiddleware } = require('@as
-integrations/express5')
const cors = require
('cors')
const express = require('express')
c
onst { makeExecutableSchema } = require('@gra
phql-tools/schema')
const http = require('htt
p')
// highlight-end
const jwt = require('jso
nwebtoken')

const resolvers = require('./res
olvers')
const typeDefs = require('./schema')

const User = require('./models/user')

const
 getUserFromAuthHeader = async (auth) => {
  
if (!auth || !auth.startsWith('Bearer ')) {
 
   return null
  }

  const decodedToken = jw
t.verify(auth.substring(7), process.env.JWT_S
ECRET)
  return User.findById(decodedToken.id
).populate('friends')
}

// highlight-start
c
onst startServer = async (port) => {
  const 
app = express()
  const httpServer = http.cre
ateServer(app)
 
  const server = new ApolloS
erver({
    schema: makeExecutableSchema({ ty
peDefs, resolvers }),
    plugins: [ApolloSer
verPluginDrainHttpServer({ httpServer })],
  
})
 
  await server.start()
 
  app.use(
    
'/',
    cors(),
    express.json(),
    expr
essMiddleware(server, {
      context: async 
({ req }) => {
        const auth = req.heade
rs.authorization
        const currentUser = 
await getUserFromAuthHeader(auth)
        ret
urn { currentUser }
      },
    }),
  )
 
  
httpServer.listen(port, () =>
    console.log
(`Server is now running on http://localhost:$
{port}`),
  )
}
// highlight-end

module.expo
rts = startServer
```

The GraphQL server in 
the *server* variable is now connected to lis
ten to the root of the server, i.e. to the */
* route, using the *expressMiddleware* object
. Information about the logged-in user is set
 in the context using the function we defined
 earlier. Since it is an Express server, the 
middlewares express-json and cors are also ne
eded so that the data included in the request
s is correctly parsed and so that CORS proble
ms do not appear.

The GraphQL server must be
 started before the Express application can b
egin listening on the specified port, so the 
_startServer_ function has been made an <i>as
ync function</i> in order to be able to wait 
for the GraphQL server to start:

```js
await
 server.start()
```

Following the recommenda
tions in the documentation, [ApolloServerPlug
inDrainHttpServer](https://www.apollographql.
com/docs/apollo-server/api/plugin/drain-http-
server) has been added to the GraphQL server 
configuration:

```js
  const server = new Ap
olloServer({
    schema: makeExecutableSchema
({ typeDefs, resolvers }),
    plugins: [Apol
loServerPluginDrainHttpServer({ httpServer })
], // highlight-line
  })
```

This plugin en
sures that the server is shut down cleanly wh
en the server process is stopped. For example
, it makes it possible to finish processing i
n-flight requests and close client connection
s so that they don’t get left hanging. 

Th
e backend code can be found on [GitHub](https
://github.com/fullstack-hy2020/graphql-phoneb
ook-backend/tree/part8-6), branch <i>part8-6<
/i>.

### Subscriptions on the server

Let's 
implement subscriptions for subscribing for n
otifications about new persons added.

The sc
hema changes like so:

```js
type Subscriptio
n {
  personAdded: Person!
}    
```

So when
 a new person is added, all of its details ar
e sent to all subscribers.

First, we have to
 install packages for adding subscriptions to
 GraphQL and a Node.js WebSocket library:

``
`bash
npm install graphql-ws ws @graphql-tool
s/schema
```

The file <i>server.js</i> is ch
anged to:

```js
// highlight-start
const { W
ebSocketServer } = require('ws')
const { useS
erver } = require('graphql-ws/use/ws')
// hig
hlight-end

// ...

const startServer = async
 (port) => {
  const app = express()
  const 
httpServer = http.createServer(app)

  // hig
hlight-start
  const wsServer = new WebSocket
Server({
    server: httpServer,
    path: '/
',
  })
 
  const schema = makeExecutableSche
ma({ typeDefs, resolvers })
  const serverCle
anup = useServer({ schema }, wsServer)
  // h
ighlight-end

  const server = new ApolloServ
er({
    // highlight-start
    schema, 
    
plugins: [
      ApolloServerPluginDrainHttpS
erver({ httpServer }),
      {
        async 
serverWillStart() {
          return {
      
      async drainServer() {
              awa
it serverCleanup.dispose();
            },
  
        }
        },
      },
    ],
    // h
ighlight-end
  })

  await server.start()

  
// ...
}
```

When queries and mutations are 
used, GraphQL uses the HTTP protocol in the c
ommunication. In case of subscriptions, the c
ommunication between client and server happen
s with [WebSockets](https://developer.mozilla
.org/en-US/docs/Web/API/WebSockets_API).

The
 configuration above creates, alongside the H
TTP request listener, a service that listens 
for WebSockets and binds it to the server’s
 GraphQL schema. The second part of the setup
 registers a function that closes the WebSock
et connection when the server is shut down. I
f you’re interested in the configurations i
n more detail, Apollo’s [documentation](htt
ps://www.apollographql.com/docs/apollo-server
/data/subscriptions) explains fairly precisel
y what each line of code does.

Unlike with H
TTP, when using WebSockets the server can als
o take the initiative in sending data. Theref
ore, WebSockets are well suited for GraphQL s
ubscriptions, where the server must be able t
o notify all clients that have made a particu
lar subscription when the corresponding event
 (e.g. creating a person) occurs.

The subscr
iption *personAdded* needs a resolver. The *a
ddPerson* resolver also has to be modified so
 that it sends a notification to subscribers.


Let’s first install a library that provid
es [publish–subscribe](https://en.wikipedia
.org/wiki/Publish%E2%80%93subscribe_pattern) 
functionality:

```
npm install graphql-subsc
riptions
```

The changes to the <i>resolvers
.js</i> file are as follows:

```js
const { G
raphQLError } = require('graphql')
const { Pu
bSub } = require('graphql-subscriptions') // 
highlight-line
const jwt = require('jsonwebto
ken')

const Person = require('./models/perso
n')
const User = require('./models/user')

co
nst pubsub = new PubSub() // highlight-line


const resolvers = {
  // ...
  Mutation: {
  
  addPerson: async (root, args, context) => {

        const currentUser = context.currentU
ser

        if (!currentUser) {
          th
row new GraphQLError('not authenticated', {
 
           extensions: {
              code: 
'UNAUTHENTICATED',
            },
          }
)
        }

        const nameExists = await
 Person.exists({ name: args.name })

        
if (nameExists) {
          throw new GraphQL
Error(`Name must be unique: ${args.name}`, {

            extensions: {
              code:
 'BAD_USER_INPUT',
              invalidArgs:
 args.name,
            },
          })
     
   }

      const person = new Person({ ...ar
gs })

      try {
        await person.save(
)
        currentUser.friends = currentUser.f
riends.concat(person)
        await currentUs
er.save()
      } catch (error) {
        thr
ow new GraphQLError(`Saving person failed: ${
error.message}`, {
          extensions: {
  
          code: 'BAD_USER_INPUT',
           
 invalidArgs: args.name,
            error,
 
         },
        })
      }


      pubsub
.publish('PERSON_ADDED', { personAdded: perso
n })  // highlight-line

      return person

    },
    // ...
  },
  // highlight-start
 
 Subscription: {
    personAdded: {
      sub
scribe: () => pubsub.asyncIterableIterator('P
ERSON_ADDED')
    },
  },
  // highlight-end

}
```

With subscriptions, communication foll
ows the publish–subscribe pattern using the
 [PubSub](https://www.apollographql.com/docs/
apollo-server/data/subscriptions#the-pubsub-c
lass) object.

There are only a few lines of 
code added, but quite a lot is happening unde
r the hood. The resolver of the *personAdded*
 subscription registers and saves info about 
all the clients that do the subscription. The
 clients are saved to an
["iterator object"](
https://www.apollographql.com/docs/apollo-ser
ver/data/subscriptions/#listening-for-events)
 called <i>PERSON\_ADDED</i>  thanks to the f
ollowing code:

```js
Subscription: {
  perso
nAdded: {
    subscribe: () => pubsub.asyncIt
erableIterator('PERSON_ADDED')
  },
},
```

T
he iterator name is an arbitrary string, but 
to follow the convention, it is the subscript
ion name written in capital letters.

Adding 
a new person <i>publishes</i> a notification 
about the operation to all subscribers with P
ubSub's method *publish*:

```js
pubsub.publi
sh('PERSON_ADDED', { personAdded: person }) 

```

Execution of this line sends a WebSocket
 message about the added person to all the cl
ients registered in the iterator <i>PERSON\_A
DDED</i>.

It's possible to test the subscrip
tions with the Apollo Explorer like this:

![
apollo explorer showing subscriptions tab and
 response](../../images/8/31x.png)

So the su
bscription is

```js
subscription Subscriptio
n {
  personAdded {
    phone
    name
  }
}

```

When the blue button <i>PersonAdded</i> 
is pressed, Explorer starts to wait for a new
 person to be added. On addition, the info of
 the added person appears on the right side o
f the Explorer.

Implementing subscriptions i
nvolves a lot of different configuration. For
 the few exercises in this course, you’ll d
o fine without worrying about all the details
. However, if you are implementing subscripti
ons in an application intended for real-world
 use, you should definitely read Apollo’s
[
documentation on subscriptions](https://www.a
pollographql.com/docs/apollo-server/data/subs
criptions).

The backend code can be found on
 [GitHub](https://github.com/fullstack-hy2020
/graphql-phonebook-backend/tree/part8-7), bra
nch <i>part8-7</i>.

### Subscriptions on the
 client

In order to use subscriptions in our
 React application, we have to do some change
s, especially to its [configuration](https://
www.apollographql.com/docs/react/data/subscri
ptions/).

Let’s add the <i>graphql-ws</i> 
library as a frontend dependency. It enables 
<i>WebSocket</i> connections for GraphQL subs
criptions:

```bash
npm install graphql-ws
``
`

The configuration in <i>main.jsx</i> has t
o be modified like so:

```js
import { Strict
Mode } from 'react'
import { createRoot } fro
m 'react-dom/client'
import App from './App.j
sx'

import {
  ApolloClient,
  ApolloLink, /
/ highlight-line
  HttpLink,
  InMemoryCache,

} from '@apollo/client'
import { ApolloProvi
der } from '@apollo/client/react'
import { Se
tContextLink } from '@apollo/client/link/cont
ext'
// highlight-start
import { GraphQLWsLin
k } from '@apollo/client/link/subscriptions'

import { getMainDefinition } from '@apollo/cl
ient/utilities'
import { createClient } from 
'graphql-ws'
// highlight-end

const authLink
 = new SetContextLink(({ headers }) => {
  co
nst token = localStorage.getItem('phonebook-u
ser-token')
  return {
    headers: {
      .
..headers,
      authorization: token ? `Bear
er ${token}` : null,
    },
  }
})

const htt
pLink = new HttpLink({ uri: 'http://localhost
:4000' })

// highlight-start
const wsLink = 
new GraphQLWsLink(
  createClient({
    url: 
'ws://localhost:4000',
  }),
)
// highlight-e
nd

// highlight-start
const splitLink = Apol
loLink.split(
  ({ query }) => {
    const de
finition = getMainDefinition(query)
    retur
n (
      definition.kind === 'OperationDefin
ition' &&
      definition.operation === 'sub
scription'
    )
  },
  wsLink,
  authLink.co
ncat(httpLink),
)
// highlight-end

const cli
ent = new ApolloClient({
  cache: new InMemor
yCache(),
  link: splitLink, // highlight-lin
e
})

createRoot(document.getElementById('roo
t')).render(
  <StrictMode>
    <ApolloProvid
er client={client}>
      <App />
    </Apoll
oProvider>
  </StrictMode>,
)
```

The new co
nfiguration is due to the fact that the appli
cation must have an HTTP connection as well a
s a WebSocket connection to the GraphQL serve
r:

```js
const httpLink = new HttpLink({ uri
: 'http://localhost:4000' })

const wsLink = 
new GraphQLWsLink(
  createClient({
    url: 
'ws://localhost:4000',
  }),
)
```

Let’s t
hen modify the application so that it subscri
bes to information about new people from the 
server. Add the code that defines the subscri
ption to the <i>queries.js</i> file:

```js
e
xport const PERSON_ADDED = gql`
  subscriptio
n {
    personAdded {
      ...PersonDetails

    }
  }

  ${PERSON_DETAILS}
`
```

Subscri
ptions are created using the [useSubscription
](https://www.apollographql.com/docs/react/ap
i/react/hooks/#usesubscription) hook function
. Let’s create a subscription in the <i>App
</i> component:

```js
import {
  useApolloCl
ient,
  useQuery,
  useSubscription, // highl
ight-line
} from '@apollo/client/react'
impor
t { useState } from 'react'
import LoginForm 
from './components/LoginForm'
import Notify f
rom './components/Notify'
import PersonForm f
rom './components/PersonForm'
import Persons 
from './components/Persons'
import PhoneForm 
from './components/PhoneForm'
import { ALL_PE
RSONS, PERSON_ADDED } from './queries' // hig
hlight-line

const App = () => {
  const [tok
en, setToken] = useState(
    localStorage.ge
tItem('phonebook-user-token'),
  )
  const [e
rrorMessage, setErrorMessage] = useState(null
)
  const result = useQuery(ALL_PERSONS)
  co
nst client = useApolloClient()

  // highligh
t-start
  useSubscription(PERSON_ADDED, {
   
 onData: ({ data }) => {
      console.log(da
ta)
    },
  })
  // highlight-end

  if (res
ult.loading) {
    return <div>loading...</di
v>
  }

  // ...
}
```

When a new person is 
now added to the phonebook, no matter where i
t's done, the details of the new person are p
rinted to the client’s console:

![dev tool
s showing data personAdded Object with Mainro
ad](../../images/8/32e.png)

When a new perso
n is added to the list, the server sends the 
details to the client, and the callback funct
ion defined as the value of the <i>useSubscri
ption</i> hook’s _onData_ attribute is call
ed, with the person added on the server passe
d to it as a parameter.

We can show the user
 a notification when a new person is added as
 follows:

```js
const App = () => {
  // ...


  useSubscription(PERSON_ADDED, {
    onDat
a: ({ data }) => {
      const addedPerson = 
data.data.personAdded // highlight-line
     
 notify(`${addedPerson.name} added`) // highl
ight-line
    }
  })

  // ...
}
```

Now, fo
r example, a person added via Apollo Studio E
xplorer is rendered immediately in the applic
ation view.  

However, there is a small prob
lem with the solution. When a new person is a
dded through the application’s form, the ad
ded person ends up in the cache twice, becaus
e both the _useSubscription_ hook and the _Pe
rsonForm_ component add the new person to the
 cache. As a result, the added person is rend
ered on the screen twice.

One possible solut
ion would be to update the cache only in the 
<i>useSubscription</i> hook. However, this is
 not recommended. As a good practice, the use
r should see the changes they make in the app
lication immediately. The cache update perfor
med by the subscription may happen with a del
ay and cannot be fully relied upon. Therefore
, we will stick with a solution where the cac
he is updated both in the _useSubscription_ h
ook and in the _PersonForm_ component.

Let�
�s solve the problem by ensuring that a perso
n is added to the cache only if they haven’
t already been added there. At the same time,
 we’ll extract the cache update operation i
nto its own helper function in the <i>utils/a
polloCache.js</i> file:

```js
import { ALL_P
ERSONS } from '../queries'

export const addP
ersonToCache = (cache, personToAdd) => {
  ca
che.updateQuery({ query: ALL_PERSONS }, ({ al
lPersons }) => {
    const personExists = all
Persons.some(
      (person) => person.id ===
 personToAdd.id,
    )

    if (personExists)
 {
      return { allPersons }
    }

    ret
urn {
      allPersons: allPersons.concat(per
sonToAdd),
    }
  })
}
```

The helper funct
ion _addPersonToCache_ updates the cache usin
g the familiar _cache.updateQuery_ method. In
 the cache update logic, we first check wheth
er the person has already been added to the c
ache. We look for the person to be added amon
g the people currently in the cache using Jav
aScript array’s _some_ method:

```js
  con
st personExists = allPersons.some(
    (perso
n) => person.id === personToAdd.id,
  )
```


_some_ is a method that searches a collection
 for an element that matches the given condit
ion. It returns a boolean indicating whether 
a matching element was found. In our case, th
e method returns _True_ if the cache already 
contains a person with that <i>id</i>, and ot
herwise it returns _False_.

If the person is
 already in the cache, we return the cache co
ntents as-is and do not add the person again.
 Otherwise, we return the cache contents with
 the new person appended using the _concat_ m
ethod:

```js
  if (personExists) {
    retur
n { allPersons }
  }

  return {
    allPerso
ns: allPersons.concat(personToAdd),
  }
```


Let’s modify the _useSubscription_ hook in 
the _App_ component so that it updates the ca
che using the _addPersonToCache_ helper funct
ion we created:

```js
import { addPersonToCa
che } from './utils/apolloCache' // highlight
-line

const App = () => {
  const [token, se
tToken] = useState(
    localStorage.getItem(
'phonebook-user-token'),
  )
  const [errorMe
ssage, setErrorMessage] = useState(null)
  co
nst result = useQuery(ALL_PERSONS)
  const cl
ient = useApolloClient()

  useSubscription(P
ERSON_ADDED, {
    onData: ({ data }) => {
  
    const addedPerson = data.data.personAdded

      notify(`${addedPerson.name} added`)
  
    addPersonToCache(client.cache, addedPerso
n) // highlight-line
    },
  })

  // ...
}

```

and we will also use the function when u
pdating the cache in connection with adding a
 new person:

```js
import { addPersonToCache
 } from '../utils/apolloCache' // highlight-l
ine

const PersonForm = ({ setError }) => {
 
 const [name, setName] = useState('')
  const
 [phone, setPhone] = useState('')
  const [st
reet, setStreet] = useState('')
  const [city
, setCity] = useState('')

  const [createPer
son] = useMutation(CREATE_PERSON, {
    onErr
or: (error) => setError(error.message),
    u
pdate: (cache, response) => {
      // highli
ght-start
      const addedPerson = response.
data.addPerson
      addPersonToCache(cache, 
addedPerson)
      // highlight-end
    },
  
})

  // ...
}
```

Now the cache update work
s correctly in all situations, meaning that a
 new person is added to the cache only if the
y haven’t already been added there.

The fi
nal code of the client can be found on [GitHu
b](https://github.com/fullstack-hy2020/graphq
l-phonebook-frontend/tree/part8-6), branch <i
>part8-6</i>.

### n+1 problem


Let's add so
me things to the backend. Let's modify the sc
hema so that a <i>Person</i> type has a *frie
ndOf* field, which tells whose friends list t
he person is on.

```js
type Person {
  name:
 String!
  phone: String
  address: Address!

  friendOf: [User!]! // highlight-line
  id: 
ID!
}
```

The application should support the
 following query:

```js
query {
  findPerson
(name: "Leevi Hellas") {
    friendOf {
     
 username
    }
  }
}
```

Because *friendOf*
 is not a field of <i>Person</i> objects on t
he database, we have to create a resolver for
 it, which can solve this issue. Let's first 
create a resolver that returns an empty list:


```js
Person: {
  address: ({ street, city 
}) => {
    return {
      street,
      city
,
    }
  },
  // highlight-start
  friendOf:
 async (root) => {
    return []
  }
  // hig
hlight-end
},
```

The parameter *root* is th
e person object for which a friends list is b
eing created, so we search from all *User* ob
jects the ones which have root._id in their f
riends list:

```js
  Person: {
    // ...
  
  friendOf: async (root) => {
      const fri
ends = await User.find({
        friends: {
 
         $in: [root._id]
        } 
      })


      return friends
    }
  },
```

Now the
 application works.

We can immediately do ev
en more complicated queries. It is possible f
or example to find the friends of all users:


```js
query {
  allPersons {
    name
    fr
iendOf {
      username
    }
  }
}
```

Howe
ver, the application now has one problem: an 
unreasonably large number of database queries
 are being made. Let’s add console logging 
to the parts of the resolvers that perform da
tabase queries:

```js
allPersons: async (roo
t, args) => {
  console.log('Person.find') //
 highlight-line
  if (!args.phone) {
    retu
rn Person.find({})
  }

  return Person.find(
{ phone: { $exists: args.phone === 'YES' } })

}
```

```js
friendOf: async (root) => {
  c
onsole.log('User.find') // highlight-line
  c
onst friends = await User.find({
    friends:
 {
      $in: [root._id],
    },
  })

  retu
rn friends
}
```

We notice that if there are
 five people in the database, the previously 
mentioned _allPersons_ query causes the follo
wing database queries:
```
Person.find
User.f
ind
User.find
User.find
User.find
User.find
`
``

So even though we primarily do one query 
for all persons, every person causes one more
 query in their resolver.

This is a manifest
ation of the famous [n+1 problem](https://www
.google.com/search?q=n%2B1+problem), which ap
pears every once in a while in different cont
exts, and sometimes sneaks up on developers w
ithout them noticing.

The right solution for
 the n+1 problem depends on the situation. Of
ten, it requires using some kind of a join qu
ery instead of multiple separate queries.

In
 our situation, the easiest solution would be
 to save whose friends list they are on each 
*Person* object:

```js
const schema = new mo
ngoose.Schema({
  name: {
    type: String,
 
   required: true,
    minlength: 5
  },
  ph
one: {
    type: String,
    minlength: 5
  }
,
  street: {
    type: String,
    required:
 true,
    minlength: 5
  },  
  city: {
    
type: String,
    required: true,
    minleng
th: 3
  },
  // highlight-start
  friendOf: [

    {
      type: mongoose.Schema.Types.Obje
ctId,
      ref: 'User'
    }
  ], 
  // high
light-end
})
```

Then we could do a "join qu
ery", or populate the *friendOf* fields of pe
rsons when we fetch the *Person* objects:

``
`js
Query: {
  allPersons: (root, args) => { 
   
    console.log('Person.find')
    if (!a
rgs.phone) {
      return Person.find({}).pop
ulate('friendOf') // highlight-line
    }

  
  return Person.find({ phone: { $exists: args
.phone === 'YES' } })
      .populate('friend
Of') // highlight-line
  },
  // ...
}
```

A
fter the change, we would not need a separate
 resolver for the *friendOf* field.

The allP
ersons query <i>does not cause</i> an n+1 pro
blem, if we only  fetch the name and the phon
e number:

```js
query {
  allPersons {
    n
ame
    phone
  }
}
```

If we modify *allPer
sons* to do a join query because it sometimes
 causes an n+1 problem, it becomes heavier wh
en we don't need the information on related p
ersons. By using the [fourth parameter](https
://www.apollographql.com/docs/apollo-server/d
ata/resolvers/#resolver-arguments) of resolve
r functions, we could optimize the query even
 further. The fourth parameter can be used to
 inspect the query itself, so we could do the
 join query only in cases with a predicted th
reat of n+1 problems. However, we should not 
jump into this level of optimization before w
e are sure it's worth it.

[In the words of D
onald Knuth](https://en.wikiquote.org/wiki/Do
nald_Knuth):

> <i>Programmers waste enormous
 amounts of time thinking about, or worrying 
about, the speed of noncritical parts of thei
r programs, and these attempts at efficiency 
actually have a strong negative impact when d
ebugging and maintenance are considered. We s
hould forget about small efficiencies, say ab
out 97% of the time: <strong>premature optimi
zation is the root of all evil.</strong></i>


GraphQL Foundation's [DataLoader](https://gi
thub.com/graphql/dataloader) library offers a
 good solution for the n+1 problem among othe
r issues. More about using DataLoader with Ap
ollo server [here](https://www.robinwieruch.d
e/graphql-apollo-server-tutorial/#graphql-ser
ver-data-loader-caching-batching) and [here](
http://www.petecorey.com/blog/2017/08/14/batc
hing-graphql-queries-with-dataloader/).

### 
Epilogue

The application we built in this pa
rt is not structured in the most optimal way.
 We did a bit of cleanup by moving the schema
 and resolvers into their own files, but ther
e is still plenty of room for improvement. Ex
amples of better ways to structure GraphQL ap
plications can be found online, for example f
or the server [here](https://www.apollographq
l.com/blog/modularizing-your-graphql-schema-c
ode) and for the client [here](https://medium
.com/@peterpme/thoughts-on-structuring-your-a
pollo-queries-mutations-939ba4746cd8).

Graph
QL is already quite an old technology: it has
 been in internal use at Facebook since 2012,
 so it can be said to be battle tested. Faceb
ook released GraphQL in 2015, and it has sinc
e become established. Even the “death” of
 REST was predicted [here](https://www.radiof
reerabbit.com/podcast/52-is-2018-the-year-gra
phql-kills-rest) before the 2020s, but that h
as not happened. REST is still widely used an
d still works excellently in many cases, and 
GraphQL is unlikely to ever replace REST. How
ever, GraphQL has become an alternative way t
o build APIs, and it is definitely worth gett
ing familiar with.
</div>

<div class="tasks"
>

### Exercises 8.23.-8.26

#### 8.23: Subsc
riptions - server

Do a backend implementatio
n for subscription *bookAdded*, which returns
 the details of all new books to its subscrib
ers.

#### 8.24: Subscriptions - client, part
 1

Start using subscriptions in the client, 
and subscribe to *bookAdded*. When new books 
are added, notify the user. Any method works.
 For example, you can use the [window.alert](
https://developer.mozilla.org/en-US/docs/Web/
API/Window/alert) function.

#### 8.25: Subsc
riptions - client, part 2

Keep the applicati
on's book view updated when the server notifi
es about new books (you can ignore the author
 view!). You can test your implementation by 
opening the app in two browser tabs and addin
g a new book in one tab. Adding the new book 
should update the view in both tabs.

#### 8.
26: n+1

Solve the n+1 problem of the followi
ng query using any method you like.

```js
qu
ery {
  allAuthors {
    name 
    bookCount

  }
}
```

### Submitting exercises and getti
ng the credits

Exercises of this part are su
bmitted via [the submissions system](https://
studies.cs.helsinki.fi/stats/courses/fs-graph
ql) just like in the previous parts, but unli
ke previous parts, the submission goes to dif
ferent "course instance". Remember that you h
ave to finish at least 22 exercises to pass t
his part!

Once you have completed the exerci
ses and want to get the credits, let us know 
through the exercise submission system that y
ou have completed the course:

![Submissions]
(../../images/11/21.png)

**Note** that you n
eed a registration to the corresponding cours
e part for getting the credits registered, se
e [here](/en/part0/general_info#parts-and-com
pletion) for more information.

You can downl
oad the certificate for completing this part 
by clicking one of the flag icons. The flag i
con corresponds to the certificate's language
.

</div>



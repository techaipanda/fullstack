---
mainImage: ../../../images/part-8.svg
part: 8
letter: e
lang: en
---
<div class="content">

We are approaching the end of this part. Let's finish by having a look at a few more details about GraphQL.

### Fragments

It is pretty common in GraphQL that multiple queries return similar results. For example, the query for the details of a person

```js
query {
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

and the query for all persons

```js
query {
  allPersons {
    name
    phone
    address{
      street 
      city
    }
  }
}
```

both return persons. When choosing the fields to return, both queries have to define exactly the same fields.

Such situations can be simplified by using [fragments](https://graphql.org/learn/queries/#fragments). A fragment that selects all of a person’s details looks like this:

```js
fragment PersonDetails on Person {
  name
  phone 
  address {
    street 
    city
  }
}
```

With the fragment, we can do the queries in a compact form:

```js
query {
  allPersons {
    ...PersonDetails // highlight-line
  }
}

query {
  findPerson(name: "Pekka Mikkola") {
    ...PersonDetails // highlight-line
  }
}
```

The fragments <i><strong>are not</strong></i> defined in the GraphQL schema, but in the client. The fragments must be declared when the client uses them for queries.

In principle, we could declare the fragment with each query like so:

```js
export const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      ...PersonDetails
    }
  }

  fragment PersonDetails on Person {
    id
    name
    phone
    address {
      street 
      city
    }
  }
`
```

However, it is much more sensible to define the fragment once and store it in a variable. Let’s add the fragment definition to the beginning of the <i>queries.js</i> file:

```js
const PERSON_DETAILS = gql`
  fragment PersonDetails on Person {
    id
    name
    phone 
    address {
      street 
      city
    }
  }
`
```

The fragment can now be embedded into all queries and mutations that need it using the [dollar curly braces](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) operation:

```js
export const FIND_PERSON = gql`
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      ...PersonDetails
    }
  }

  ${PERSON_DETAILS}
`
```

So the template literal in the *PERSON_DETAILS* variable is now inserted as part of the *FIND_PERSON* template literal. In practice, the end result is exactly the same as in the earlier example, where the fragment was defined directly alongside the query.


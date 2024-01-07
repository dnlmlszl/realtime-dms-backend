## GraphQL API Endpoints

### Queries

- **hello**: Returns a simple 'world' string.
- **users**: Retrieves all users.
- **usersCount**: Retrieves the count of all users.
- **clients**: Retrieves all clients.
- **clientsCount**: Retrieves the count of all clients.
- **findClient(clientId: ID!)**: Retrieves a client by the id of the client.
- **me**: Retrieves the data of the current user.

### Mutations

- **createUser(email: String!, password: String!)**: Creates a new user.
- **login(email: String!, password: String!)**: Logs in a user and returns a token.
- **addClient(name: String!)**: Creates a new client.
- **addCategory(name: String!)**: Creates a new category.
- **addCategoryToClient(clientId: ID!, name: String!)**: Assigns a category to the selected client.
- **addSubgroup(name: String!, categoryId: ID!)**: Creates a new subgroup and assigns it to a category.
- **addProcess(name: String!, subgroupId: ID!)**: Creates a new process and assigns it to a subgroup.
- **addFavorite(userId: ID!, clientId: ID!):**: Assigns the selected client as favorite to the user.

### Queries

# Current user query

query {
    me {
        _id
        email
        favorites {
            _id
            name
        }
    }
}

# All users query

query {
  users {
    _id
    email
  }
}

# Users count query

query {
  usersCount
}


# All clients query

query {
    clients {
        _id
        name
    }
}

# Clients count query

query {
  clientsCount
}

# Single client query

query {
    findClient(clientId: "client_id") {
        _id
        name
        processGroups {
            _id
            name
            subgroups {
                _id
                name
                processes {
                    _id
                    name
                }
            }
        }
    }
}

# All categories query

query {
  categories {
    _id
    name
    subgroups {
      _id
      name
    }
  }
}

# All subgroups query

query {
  subgroups {
    _id
    name
    processes {
      _id
      name
    }
  }
}

# All processes query

query {
  processes {
    _id
    name
  }
}


### Mutations

# Create user

mutation {
  createUser(email: "example@example.com", password: "password123") {
    _id
    email
  }
}

# Login

mutation {
  login(email: "example@example.com", password: "password123") {
    value
  }
}

# Add new client

mutation {
  addClient(name: "AlphaCorp") {
    _id
    name
    processGroups {
      _id
      name
    }
  }
}

# Add category to client

mutation {
  addCategoryToClient(clientId: "client_id_here", name: "New Category") {
    _id
    name
    processGroups {
      _id
      name
    }
  }
}

# Add category to multiple clients

mutation {
  addCategoryToMultipleClients(categoryId: "category_id_here", clientIds: ["client_Id1", client_Id2", ...]) {
    _id
    name
    processGroups {
      _id
      name
    }
  }
}

# Add new category

mutation {
    addCategory(name: "category_name") {
        _id
        name
    }
}

# Add new subgroup to category

mutation {
  addSubgroup(name: "New Subgroup", categoryId: "category_id_here") {
    _id
    name
  }
}

# Add new process to subgroup

mutation {
  addProcess(name: "New Process", subgroupId: "subgroup_id_here") {
    _id
    name
  }
}

# Add client as favorite to user

mutation {
  addFavorite(userId: "user_id_here", clientId: "client_id_here") {
    _id
    email
    favorites {
      _id
      name
    }
  }
}

# Toggle client as favorite to user

mutation {
  toggleFavorite(userId: "user_id_here", clientId: "client_id_here") {
    _id
    email
    favorites {
      _id
      name
    }
  }
}

# Reassign category to client

mutation {
    reassignClient(oldClientId: "client_id_here", newClientId: "other_client_id_here", categoryId: "category_id_here) {
        _id
        name
    }
}

# Reassign processgroup to category

mutation {
    reassignSubgroup(oldCategoryId: "category_id_here", newCategoryId: "other_category_id_here", subgroupId: "subgroup_id_here) {
        _id
        name
    }
}

# Reassign process to subgroup

mutation {
    reassignProcess(oldSubgroupId: "subgroup_id_here", newSubgroupId: "other_subgroup_id_here", processId: "process_id_here) {
        _id
        name
    }
}

# Add multiple processes to subgroup

mutation {
    batchAddProcesses(processIds: ["processId1", "processId2", ...], subgroupId: "subgroup_id_here") {
        _id
        name
    }
}

# Remove subgroup from category

mutation {
  removeSubgroupFromCategory(categoryId: "category_id_here", subgroupId: "subgroup_id_here") {
    _id
    name
    subgroups
  }
}

# Remove process from subgroup

mutation {
  removeProcessFromSubgroup(subgroupId: "subgroup_id_here", processId: "process_id_here") {
    _id
    name
    processes
  }
}

# Toggle category

mutation {
  toggleCategory(categoryId: "category_id_here") {
    _id
    name
    hidden
  }
}

# Toggle subgroup

mutation {
  toggleSubgroup(subgroupId: "subgroup_id_here") {
    _id
    name
    hidden
  }
}

# Toggle process

mutation {
  toggleProcess(processId: "process_id_here") {
    _id
    name
    hidden
  }
}

# Hide entities for client and for user

mutation {
  hideEntityForClient(userId: "user_id_here", clientId: "client_id_here", entityId: "entity_id_here", entityType: "Category") {
    clientId
    hiddenEntities {
      entityId
      entityType
      hidden
    }
  }
}
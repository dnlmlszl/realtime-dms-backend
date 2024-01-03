const typeDefs = `

    type Token {
        value: String!    
    }

    type User {
        _id: ID!
        email: String!
        passwordHash: String!
        favorites: [Client]
        profileImage: String
        description: String
        settings: UserSettings
        role: String
    }

    type UserSettings {
        notifications: Boolean
        theme: String
    }

    type Client {
        _id: ID!
        name: String!
        taxId: String
        description: String
        processGroups: [Category]
        isFavorite: Boolean!
    }
    
    type Category {
        _id: ID!
        name: String!
        subgroups: [Subgroup]
        hidden: Boolean!
    }

    type Subgroup {
        _id: ID!
        name: String!
        processes: [Process]
        hidden: Boolean!
    }

    type Process {
        _id: ID!
        name: String!
        hidden: Boolean!
    }

    type AuditLog {
        _id: ID!
        action: String!
        timestamp: String!
        userId: ID!
        details: String
    }

    type Error {
        code: String!
        message: String!
        details: String
    }

    type WebhookResponse {
        success: Boolean!
        message: String!
    }

    type ClientSpecificSettings {
        clientId: ID!
        hiddenEntities: [HiddenEntity]
    }
    
    type HiddenEntity {
        entityId: ID!
        entityType: String!
        hidden: Boolean!
    }

    extend type Mutation {
        hideEntityForClient(clientId: ID!, entityId: ID!, entityType: String!): ClientSpecificSettings
    }

    type Query {
        hello: String

        users: [User]
        usersFilter(filter: UserFilter, sort: UserSort): [User]
        usersCount: Int
        singleUser(userId: ID!): User
        token(email: String!, password: String!): Token
        me: User

        clients: [Client]
        clientsCount: Int
        clientDetail(clientId: ID!): Client
        findClient(clientId: ID!): Client

        categories: [Category]
        findCategory(categoryId: ID!): Category
        toggleCategory(categoryId: ID!): Category

        subgroups: [Subgroup]
        findSubgroup(subgroupId: ID!): Subgroup
        toggleSubgroup(subgroupId: ID!): Subgroup

        processes: [Process]
        findProcess(processId: ID!): Process
        toggleProcess(processId: ID!): Process

        getVisibleCategoriesForClient(clientId: ID!): [Category]

        auditLogs: [AuditLog]
        registerWebhook(url: String!): WebhookResponse!

        

    }

    input UserFilter {
        email: String
        isFavorite: Boolean
    }
    
    input UserSort {
        field: String!
        order: String! 
    }

    union UserResult = User | Error

    type Mutation {

        createUser(email: String!, password: String!, profileImage: String, description: String): UserResult
        login(email: String!, password: String!): Token

        addFavorite(userId: ID!, clientId: ID!): User
        toggleFavorite(userId: ID!, clientId: ID!): User

        addClient(name: String!): Client
        usersFilter(filter: UserFilter, sort: UserSort): [User]

        addCategory(name: String!): Category
        addCategoryToClient(clientId: ID!, name: String!): Client
        addCategoryToMultipleClients(categoryId: ID!, clientIds: [ID]!): [Client]
        reassignCategory(oldClientId: ID!, newClientId: ID!, categoryId: ID!): Category
        toggleCategory(categoryId: ID!): Category

        addSubgroup(name: String!, categoryId: ID!): Subgroup
        reassignSubgroup(oldCategoryId: ID!, newCategoryId: ID!, subgroupId: ID!): Subgroup
        toggleSubgroup(subgroupId: ID!): Subgroup

        
        addProcess(name: String!, subgroupId: ID!): Process
        toggleProcess(processId: ID!): Process
        batchAddProcesses(processIds: [ID]!, subgroupId: ID!): [Process]
        reassignProcess(oldSubgroupId: ID!, newSubgroupId: ID!, processId: ID!): Process        

        hideEntityForClient(userId: ID!, clientId: ID!, entityId: ID!, entityType: String!): ClientSpecificSettings
        
    }


`;

module.exports = typeDefs;

import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        Users: {
            id: string
            name: string
            email: string
            sessionId?: string 
            created_at: string,
            updated_at: string,
            deleted_at: string
        },
        Meals: {
            id: string
            name: string
            description: string
            date: string,
            hour: string,
            userId: string,
            isOnDiet: boolean,
            created_at: string,
            updated_at: string,
            deleted_at: string
        }
    }
}
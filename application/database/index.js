import Sequelize from 'sequelize'
import { InfluxDB, FieldType } from 'influx'
import Promise from 'bluebird'
import models from './models'
import seeder from './seeders'
import schemas from './schemas'

export default {
    /**
     * Sets up the Seqelize & MySQL databases, imports and links their relations
     * @return {object} instantiated database objects
     */
    async connect() {
        this.sync = (
            environment.get('database.force') === true &&
            environment.get('environment') === 'development'
        )

        this.seed = (
            environment.get('database.force') === true &&
            environment.get('database.seed') === true &&
            environment.get('environment') === 'development'
        )

        this.postgres = new Sequelize(
            environment.get('database.postgres.database'),
            environment.get('database.postgres.user'),
            environment.get('database.postgres.password'),
            {
                host: environment.get('database.postgres.host'),
                dialect: 'postgres',
                port: environment.get('database.postgres.port'),
                logging: false
            }
        )


        this.influx = new InfluxDB({
            host: environment.get('database.influxdb.host'),
            database: environment.get('database.influxdb.database'),
            schema: schemas
        })

        console.log(this.schema)

        const executions = [
            console.log(`${colors.yellow('Importing')} models into Postgres database`),
            console.log('--------------------------------'),
            this.models = await models.import(this.postgres),
            console.log('--------------------------------')
        ]

        if (this.sync) {
            executions.push(
                console.log(`${(this.sync ? colors.red('Force syncing') : colors.green('soft syncing'))} models to Postgres database`),
                await this.postgres.sync({ force: this.sync })
                    .then(() => console.log(`Postgres database sync was ${colors.green('successful')}`))
                    .catch(error => console.log('Postgres database sync failed: ', error)),
                console.log('--------------------------------')
            )
        }

        if (this.seed) {
            executions.push(
                console.log(`${colors.red('De-seeding')} Postgres database`),
                console.log('--------------------------------'),
                await seeder.down(this)
                    .then(() => console.log('--------------------------------'))
                    .then(() => console.log(`Postgres Database de-seed was ${colors.green('successful')}`))
                    .catch(error => console.log('Postgres Database de-seed failed: ', error)),
                console.log('--------------------------------'),


                console.log(`${colors.red('Seeding')} Postgres database`),
                console.log('--------------------------------'),
                await seeder.up(this)
                    .then(() => console.log('--------------------------------'))
                    .then(() => console.log(`Postgres database seed was ${colors.green('successful')}`))
                    .catch(error => console.log('Postgres database seed failed: ', error)),
                console.log('--------------------------------')
            )
        }

        /**
        * Make sure the Influx database exists
        */
        executions.push(
            await this.influx.getDatabaseNames()
                .then((names) => {
                    if (names.includes(environment.get('database.influxdb.database'))) {
                        if (this.sync) {
                            return this.influx.dropDatabase(environment.get('database.influxdb.database')).then(() => {
                                console.log(`Existing Influx database has been ${colors.red('dropped')}`)

                                return this.influx.createDatabase(environment.get('database.influxdb.database')).then((result) => {
                                    console.log(`New Influx database creation ${colors.green('successful')}`)
                                })
                            })
                        }
                    } else {
                        console.log(`Specified Influx database ${colors.yellow(environment.get('database.influxdb.database'))} does not exist, creating...`)
                        return this.influx.createDatabase(environment.get('database.influxdb.database')).then((result) => {
                            console.log(`New Influx database creation ${colors.green('successful')}`)
                        })
                    }
                })
                .then(() => console.log(`Connection to Influx database was ${colors.green('successful')}`))
                .catch(error => console.error(`Error creating Influx database: `, error)),
            console.log('--------------------------------')
        )

        return Promise.each(executions, () => { }, { concurrency: 1 })
    },


    /**
     * When we force sync, the database rebuilds all of it's tables (models)
     * as well as their associations. Any schema changes as well as data
     * inserted into the database is lost when this is done. This should
     * only ever be done in a development environment.
     */
    sync: null,


    /**
     * When we seed the database, we are inserting demonstration data that
     * located in the /seeders/data directory. In order to seed the database
     * it is required that it has been force synced and wiped clean,
     * otherwise there will be injection collisions on the data. This is
     * intended to be run in a development environment, not on production.
     */
    seed: null,


    /**
     * The Postgres database client
     */
    postgres: null,


    /**
     * The InfluxDB database client
     */
    influx: null,


    /**
     * Database tables represented as JavaScript objects
     */
    models: null,


    /**
     * Terminates the connection to both databases
     */
    disconnect() {
        if (this.postgres !== null) this.postgres = null
    }
}

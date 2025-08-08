const { Client, logger } = require('./lib/client')
const { DATABASE, VERSION, AUTO_STATUS_VIEW } = require('./config') // ⬅ Import de AUTO_STATUS_VIEW
const { stopInstance } = require('./lib/pm2')

const start = async () => {
  logger.info(`levanter ${VERSION}`)
  try {
    await DATABASE.authenticate({ retry: { max: 3 } })
  } catch (error) {
    const databaseUrl = process.env.DATABASE_URL
    logger.error({ msg: 'Unable to connect to the database', error: error.message, databaseUrl })
    return stopInstance()
  }
  try {
    const bot = new Client()
    await bot.connect()

    // 🔹 Activation de la vue automatique des statuts
    if (AUTO_STATUS_VIEW) {
      logger.info("AUTO_STATUS_VIEW activé : lecture automatique des statuts.")
      bot.on('status-update', async (update) => {
        try {
          await bot.readStatus(update.id)
          logger.info(`Statut vu : ${update.id}`)
        } catch (err) {
          logger.error(`Erreur lecture statut : ${err.message}`)
        }
      })
    }

  } catch (error) {
    logger.error(error)
  }
}
start()

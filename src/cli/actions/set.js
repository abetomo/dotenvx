const logger = require('./../../shared/logger')

const main = require('./../../lib/main')

function set (key, value) {
  logger.debug(`key: ${key}`)
  logger.debug(`value: ${value}`)

  const options = this.opts()
  logger.debug(`options: ${JSON.stringify(options)}`)

  // 1. read .env file
  // 2. parse it for key/values ?
  // 3. locate if already an existing key?
  // 4. write/append the new key=value - start here

  try {
    const {
      processedEnvFiles,
      settableFilepaths
    } = main.set(key, value, options.envFile)

    for (const processedEnvFile of processedEnvFiles) {
      logger.verbose(`setting for ${processedEnvFile.filepath}`)

      if (processedEnvFile.error) {
        if (processedEnvFile.error.code === 'MISSING_ENV_FILE') {
          logger.warn(processedEnvFile.error)
          logger.help(`? add one with [echo "HELLO=World" > ${processedEnvFile.filepath}] and re-run [dotenvx set]`)
        } else {
          logger.warn(processedEnvFile.error)
        }
      } else {
        logger.verbose(`${processedEnvFile.key} set`)
        logger.debug(`${processedEnvFile.key} set to ${processedEnvFile.value}`)
      }
    }

    logger.success(`set ${key} (${settableFilepaths.join(', ')})`)
  } catch (error) {
    logger.error(error.message)
    if (error.help) {
      logger.help(error.help)
    }
  }

  // if (typeof value === 'object' && value !== null) {
  //   if (options.prettyPrint) {
  //     logger.blank0(JSON.stringify(value, null, 2))
  //   } else {
  //     logger.blank0(value)
  //   }
  // } else {
  //   logger.blank0(value)
  // }
}

module.exports = set

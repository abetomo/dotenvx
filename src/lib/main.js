// @ts-check
const path = require('path')

// shared
const { setLogLevel, logger } = require('./../shared/logger')
const { getColor, bold } = require('./../shared/colors')

// services
const Ls = require('./services/ls')
const Run = require('./services/run')
const Keypair = require('./services/keypair')
const Genexample = require('./services/genexample')

// helpers
const conventions = require('./helpers/conventions')
const dotenvOptionPaths = require('./helpers/dotenvOptionPaths')
const Parse = require('./helpers/parse')
const DeprecationNotice = require('./helpers/deprecationNotice')

/** @type {import('./main').config} */
const config = function (options = {}) {
  // allow user to set processEnv to write to
  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  // overload
  const overload = options.overload || options.override

  // ignore
  const ignore = options.ignore || []

  // strict
  const strict = options.strict

  // DOTENV_KEY (DEPRECATED)
  let DOTENV_KEY = process.env.DOTENV_KEY
  if (options && options.DOTENV_KEY) {
    DOTENV_KEY = options.DOTENV_KEY
  }

  if (options) setLogLevel(options)

  // build envs using user set option.path
  const optionPaths = dotenvOptionPaths(options) // [ '.env' ]

  try {
    let envs = []
    // handle shorthand conventions - like --convention=nextjs
    if (options.convention) {
      envs = conventions(options.convention).concat(envs)
    }

    new DeprecationNotice({ DOTENV_KEY }).dotenvKey() // DEPRECATION NOTICE

    for (const optionPath of optionPaths) {
      // if DOTENV_KEY is set then assume we are checking envVaultFile
      if (DOTENV_KEY) {
        envs.push({
          type: 'envVaultFile',
          value: path.join(path.dirname(optionPath), '.env.vault')
        })
      } else {
        envs.push({ type: 'envFile', value: optionPath })
      }
    }

    const {
      processedEnvs,
      readableFilepaths,
      uniqueInjectedKeys
    } = new Run(envs, overload, DOTENV_KEY, processEnv).run()

    let lastError
    /** @type {Record<string, string>} */
    const parsedAll = {}

    for (const processedEnv of processedEnvs) {
      if (processedEnv.type === 'envVaultFile') {
        logger.verbose(`loading env from encrypted ${processedEnv.filepath} (${path.resolve(processedEnv.filepath)})`)
        logger.debug(`decrypting encrypted env from ${processedEnv.filepath} (${path.resolve(processedEnv.filepath)})`)
      }

      if (processedEnv.type === 'envFile') {
        logger.verbose(`loading env from ${processedEnv.filepath} (${path.resolve(processedEnv.filepath)})`)
      }

      for (const error of processedEnv.errors || []) {
        if (strict) throw error // throw immediately if strict

        if (ignore.includes(error.code)) {
          continue // ignore error
        }

        lastError = error // surface later in { error }

        if (error.code === 'MISSING_ENV_FILE') {
          if (!options.convention) { // do not output error for conventions (too noisy)
            console.error(error.message)
            if (error.help) {
              console.error(error.help)
            }
          }
        } else {
          console.error(error.message)
          if (error.help) {
            console.error(error.help)
          }
        }
      }

      Object.assign(parsedAll, processedEnv.injected || {})
      Object.assign(parsedAll, processedEnv.preExisted || {}) // preExisted 'wins'

      // debug parsed
      logger.debug(processedEnv.parsed)

      // verbose/debug injected key/value
      for (const [key, value] of Object.entries(processedEnv.injected || {})) {
        logger.verbose(`${key} set`)
        logger.debug(`${key} set to ${value}`)
      }

      // verbose/debug preExisted key/value
      for (const [key, value] of Object.entries(processedEnv.preExisted || {})) {
        logger.verbose(`${key} pre-exists (protip: use --overload to override)`)
        logger.debug(`${key} pre-exists as ${value} (protip: use --overload to override)`)
      }
    }

    let msg = `injecting env (${uniqueInjectedKeys.length})`
    if (readableFilepaths.length > 0) {
      msg += ` from ${readableFilepaths.join(', ')}`
    }
    logger.successv(msg)

    if (lastError) {
      return { parsed: parsedAll, error: lastError }
    } else {
      return { parsed: parsedAll }
    }
  } catch (error) {
    if (strict) throw error // throw immediately if strict

    logger.error(error.message)
    if (error.help) {
      logger.help(error.help)
    }

    return { parsed: {}, error }
  }
}

/** @type {import('./main').parse} */
const parse = function (src, options = {}) {
  // allow user to set processEnv to read from
  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  // private decryption key
  const privateKey = options.privateKey || null

  // overload
  const overload = options.overload || options.override

  const { parsed, errors } = new Parse(src, privateKey, processEnv, overload).run()

  // display any errors
  for (const error of errors) {
    console.error(error.message)
    if (error.help) {
      console.error(error.help)
    }
  }

  return parsed
}

/** @type {import('./main').ls} */
const ls = function (directory, envFile, excludeEnvFile) {
  return new Ls(directory, envFile, excludeEnvFile).run()
}

/** @type {import('./main').genexample} */
const genexample = function (directory, envFile) {
  return new Genexample(directory, envFile).run()
}

/** @type {import('./main').keypair} */
const keypair = function (envFile, key) {
  return new Keypair(envFile, key).run()
}

module.exports = {
  // dotenv proxies
  config,
  parse,
  // actions related
  ls,
  keypair,
  genexample,
  // expose for libs depending on @dotenvx/dotenvx - like dotenvx-pro
  setLogLevel,
  logger,
  getColor,
  bold
}

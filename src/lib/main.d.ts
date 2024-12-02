import type { URL } from 'url';

export interface DotenvParseOptions {
  /**
   * Override any environment variables that have already been set on your machine with values from your .env file.
   * @default false
   * @example require('@dotenvx/dotenvx').config({ overload: true })
   * @alias overload
   */
  overload?: boolean;

  /**
   * @default false
   * @alias override
   */
  override?: boolean;

  /**
   * Specify an object to read existing environment variables from. Defaults to process.env environment variables.
   *
   * @default process.env
   * @example const processEnv = {}; require('@dotenvx/dotenvx').parse('HELLO=World', { processEnv: processEnv })
   */
  processEnv?: DotenvPopulateInput;

  /**
   * Specify a privateKey to decrypt any encrypted contents with.
   *
   * @default undefined
   * @example require('@dotenvx/dotenvx').parse('HELLO="encrypted:BE9Y7LKANx77X1pv1HnEoil93fPa5c9rpL/1ps48uaRT9zM8VR6mHx9yM+HktKdsPGIZELuZ7rr2mn1gScsmWitppAgE/1lVprNYBCqiYeaTcKXjDUXU5LfsEsflnAsDhT/kWG1l"', { privateKey: 'a4547dcd9d3429615a3649bb79e87edb62ee6a74b007075e9141ae44f5fb412c' })
   */
  privateKey?: string;
}

export interface DotenvParseOutput {
  [name: string]: string;
}

/**
 * Parses a string or buffer in the .env file format into an object.
 *
 * @see https://dotenvx.com/docs
 * @param src - contents to be parsed. example: `'DB_HOST=localhost'`
 * @param options - additional options. example: `{ prcoessEnv: {}, privateKey: '<privateKey>', overload: false }`
 * @returns an object with keys and values based on `src`. example: `{ DB_HOST : 'localhost' }`
 */
export function parse<T extends DotenvParseOutput = DotenvParseOutput>(
  src: string | Buffer,
  options?: DotenvParseOptions
): T;

export interface DotenvConfigOptions {
  /**
   * Specify a custom path if your file containing environment variables is located elsewhere.
   * Can also be an array of strings, specifying multiple paths.
   *
   * @default require('path').resolve(process.cwd(), '.env')
   * @example require('@dotenvx/dotenvx').config({ path: '/custom/path/to/.env' })
   * @example require('@dotenvx/dotenvx').config({ path: ['/path/to/first.env', '/path/to/second.env'] })
   */
  path?: string | string[] | URL;

  /**
   * Specify the encoding of your file containing environment variables.
   *
   * @default 'utf8'
   * @example require('@dotenvx/dotenvx').config({ encoding: 'latin1' })
   */
  encoding?: string;

  /**
   * Override any environment variables that have already been set on your machine with values from your .env file.
   * @default false
   * @example require('@dotenvx/dotenvx').config({ overload: true })
   * @alias overload
   */
  overload?: boolean;

  /**
   * @default false
   * @alias override
   */
  override?: boolean;

  /**
   * Specify an object to write your secrets to. Defaults to process.env environment variables.
   *
   * @default process.env
   * @example const processEnv = {}; require('@dotenvx/dotenvx').config({ processEnv: processEnv })
   */
  processEnv?: DotenvPopulateInput;

  /**
   * Pass the DOTENV_KEY directly to config options. Defaults to looking for process.env.DOTENV_KEY environment variable. Note this only applies to decrypting .env.vault files. If passed as null or undefined, or not passed at all, dotenv falls back to its traditional job of parsing a .env file.
   *
   * @default undefined
   * @example require('@dotenvx/dotenvx').config({ DOTENV_KEY: 'dotenv://:key_1234…@dotenvx.com/vault/.env.vault?environment=production' })
   */
  DOTENV_KEY?: string;

  /**
   * Load a .env convention (available conventions: 'nextjs')
   */
  convention?: string;

  /**
   * Turn on logging to help debug why certain keys or values are not being set as you expect.
   *
   * @default false
   * @example require('@dotenvx/dotenvx').config({ debug: process.env.DEBUG })
   */
  debug?: boolean;

  verbose?: boolean;

  quiet?: boolean;

  logLevel?:
    | 'error'
    | 'errorv'
    | 'errorvp'
    | 'errorvpb'
    | 'errornocolor'
    | 'warn'
    | 'warnv'
    | 'warnvp'
    | 'warnvpb'
    | 'success'
    | 'successv'
    | 'successvp'
    | 'successvpb'
    | 'info'
    | 'help'
    | 'help2'
    | 'http'
    | 'verbose'
    | 'debug'
    | 'blank';
}

export interface DotenvConfigOutput {
  error?: Error;
  parsed?: DotenvParseOutput;
}

export interface DotenvPopulateInput {
  [name: string]: string;
}

/**
 * Loads `.env` file contents into process.env by default. If `DOTENV_KEY` is present, it smartly attempts to load encrypted `.env.vault` file contents into process.env.
 *
 * @see https://dotenvx.com/docs
 *
 * @param options - additional options. example: `{ path: './custom/path', encoding: 'latin1', debug: true, overload: false }`
 * @returns an object with a `parsed` key if successful or `error` key if an error occurred. example: { parsed: { KEY: 'value' } }
 *
 */
export function config(options?: DotenvConfigOptions): DotenvConfigOutput;

/**
 * List all env files in the current working directory
 *
 * @param directory - current working directory
 * @param envFile - glob pattern to match env files
 * @param excludeEnvFile - glob pattern to exclude env files
 */
export function ls(
  directory: string,
  envFile: string | string[],
  excludeEnvFile: string | string[]
): string[];

export type GenExampleOutput = {
  envExampleFile: string;
  envFile: string | string[];
  exampleFilepath: string;
  addedKeys: string[];
  injected: Record<string, string>;
  preExisted: Record<string, string>;
};

/**
 * Generate an example .env file
 *
 * @param directory - current working directory
 * @param envFile - path to the .env file(s)
 */
export function genexample(
  directory: string,
  envFile: string
): GenExampleOutput;

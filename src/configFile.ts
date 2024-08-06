import fs from 'fs'
import path from 'path';
import { CLIError } from './CLIError';

const CONFIG_FILE_NAME = 'pncli-config.json';

const filesToLookFor = [
{
    name: 'docker-compose.yml',
    atribute: 'composeDev'
},
{
    name: 'docker-compose.dev.yml',
    atribute: 'compose'
},
{
    name: '.env',
    atribute: 'env'
}
] as const satisfies { name: string, atribute: string }[]

type Config = {
    rootDir: string,
    files: {
        [key in typeof filesToLookFor[number]['atribute']]: string
    }
}

export async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * Finds the directory containg the config files by navigating up directories
 * @param filesToLookFor the files to look for. All the files must be in the same directory
 * @returns the root directory of the project
 */
export async function findDirContaining(filesToLookFor: string[]): Promise<string> {
    let currentDir = process.cwd()
    const MAX_DEEP = 12
    let iterations = 0
    while (true) {
        iterations++
        if ((await Promise.all(
            filesToLookFor.map(async file => await fileExists(`${currentDir}/${file}`))
            )
        ).every(exists => exists))
        {
            return currentDir
        }
        currentDir = currentDir.split('/').slice(0, -1).join('/')
        if (!currentDir.includes('/') || iterations >= MAX_DEEP) {
            throw new CLIError('Could not find the root directory')
        }
    }
}

/**
 * Looks for the cli configuration file in the current directory
 * If it cant find it it will go up directories until it finds it
 * @returns the configuration.
 */
export async function getConfig(): Promise<Config> {
    const configFileDir = await findDirContaining([CONFIG_FILE_NAME])
    const configFile = path.join(configFileDir, CONFIG_FILE_NAME)
    try {
        const configFileContent = await fs.promises.readFile(configFile, 'utf-8')
        const parse = JSON.parse(configFileContent)
        for (const file of filesToLookFor) {
            if (!parse.files[file.atribute]) {
                throw new CLIError(`The ${file.name} attribute in the configuration file is incorrect - The cli config is corrupted`)
            }
        }
        if (typeof parse.rootDir !== 'string') throw new CLIError('The root directory in the configuration file is incorrect - The cli config is corrupted')
        if (configFileDir !== parse.rootDir) throw new CLIError('The root directory in the configuration file is incorrect - The cli config is corrupted')
        return {
            rootDir: parse.rootDir,
            files: {
                composeDev: parse.files.composeDev,
                compose: parse.files.compose,
                env: parse.files.env
            }
        }
        
    } catch (e) {
        throw new CLIError('Error reading the configuration file')
    }
}

/**
 * Looks for all the configuration files in the cwd. If the files cant be found there
 * it will go up directories until it finds it.
 * @returns the configuration. 
 */
export async function setConfig(): Promise<Config> {
    const rootDir = await findDirContaining(filesToLookFor.map(file => file.name))
    const config: Config = {
        rootDir: rootDir,
        files: {
            composeDev: filesToLookFor.find(file => file.name === 'docker-compose.yml')?.name || '',
            compose: filesToLookFor.find(file => file.name === 'docker-compose.dev.yml')?.name || '',
            env: filesToLookFor.find(file => file.name === '.env')?.name || '',
        },
    }

    const pathToConfig = path.join(rootDir, CONFIG_FILE_NAME)
    try {
        await fs.promises.unlink(pathToConfig)
    } catch { }
    try {
        await fs.promises.writeFile(pathToConfig, JSON.stringify(config, null, 4))
        return config
    } catch (e) {
        throw new CLIError('Error writing the configuration file')
    }
}
import fs from 'fs'
import chalk from 'chalk'
import { fileExists, findDirContaining } from './configFile'
import path from 'path'
import { CLIError } from './CLIError'

/**
 * Function to copy a default file to a file like default.env -> .env
 * If the file exists already. nothing will happen
 * @param defaultFile - The default file to copy
 * @param file - The file to copy to
 */
export async function defaultFileCopy(defaultFile: string, file: string) {
    const dirOfDefault = await findDirContaining([defaultFile])
    if (await fileExists(path.join(dirOfDefault, file))) return

    
    const sourcePath = path.join(dirOfDefault, defaultFile);
    const destinationPath = path.join(dirOfDefault, file);

    try {
        console.log(chalk.yellow(`Creating a new ${file} file from ${defaultFile}`))
        await fs.promises.copyFile(sourcePath, destinationPath);
        console.log(chalk.green(`Created the ${file} file`))
    } catch (error) {
        throw new CLIError(`Error creating the ${file} file`)
    }
}
import chalk from 'chalk'
import { Command } from 'commander'
import { version } from '../package.json'
import { exec } from 'child_process'
import { setConfig } from './configFile'
import { defaultFileCopy } from './defaultFileCopy'
import { safeCall } from './CLIError'

const program = new Command()

program.version(version).description('The project next CLI')

program.command('init').description('Initialize the CLI').action(safeCall(async () => {
    console.log(chalk.green('Initializing the CLI'))
    await defaultFileCopy('default.env', '.env')
    await defaultFileCopy('next-env.default.d.ts', 'next-env.d.ts')
    console.log(chalk.green('Updating the configuration file'))
    const config = await setConfig()
}))

program.command('dev').description('Run the project in development mode').action(() => {
    console.log(chalk.green('Running in development mode'))
})

program.command('build').description('Build the project').action(() => {
    console.log(chalk.green('Project next is building'))
})

program.command('start').description('Start the project').action(() => {
    console.log(chalk.green('Starting the project'))
})

program.command('test').description('Run the tests').action(() => {
    console.log(chalk.green('Running the tests'))
})

program.command('lint').description('Lint the project using eslint').action(() => {
    console.log(chalk.green('Linting the project'))
    exec('next lint --fix', (err, stdout, stderr) => {
        if (err) {
            console.log(chalk.red('Error running lint'))
            console.log(stderr)
            return
        }
        console.log(stdout)
    })
})

program.command('scaffold <thing>').description('Scaffold a new thing').action((thing) => {
    console.log(chalk.green(`Scaffolding a new ${thing}`))
    switch (thing) {
    case 'action':
        console.log(chalk.green('Creating a new action'))
        break
    case 'component':
        console.log(chalk.green('Creating a new component'))
        break
    }
})

program.parse(process.argv)
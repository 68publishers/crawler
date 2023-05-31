import { config as runDotenv } from 'dotenv';
import { Bootstrap } from '../bootstrap.mjs';
import { program } from 'commander';
import Table from 'cli-table3';
import inquirer from 'inquirer';
import chalk from 'chalk';

runDotenv();

const container = Bootstrap.boot();
const userRepository = container.resolve('userRepository');
const scenarioSchedulerRepository = container.resolve('scenarioSchedulerRepository');
const databaseClient = container.resolve('databaseClient');

program
    .command('user:list')
    .action(async () => {
        const users = await userRepository.list();
        const table = new Table({
            head: [chalk.cyan('ID'), chalk.cyan('Username'), chalk.cyan('Created at'), chalk.cyan('Callback URI Token')],
            colWidths: [40, 30, 30, 60],
        });

        for (let user of users) {
            table.push([
                user.id,
                user.username,
                user.createdAt.toISOString(),
                user.callbackUriToken,
            ]);
        }

        if (0 >= users.length) {
            table.push([{
                content: chalk.bgYellow('No users found.'),
                colSpan: 4,
                hAlign: 'center',
            }]);
        }

        console.log(table.toString());
        process.exit(0);
    });

program
    .command('user:create')
    .action(async () => {
        const questions = [
            { type: 'input', name: 'username', message: 'Username:' },
            { type: 'password', name: 'password', message: 'Password:' },
        ];

        const answers = await inquirer.prompt(questions);
        const { username, password } = answers;

        let existingUser = await userRepository.getByUsername(username);

        if (null !== existingUser) {
            console.log(chalk.bgYellow(`User "${username}" already exists.`));
            process.exit(1);
        }

        const id = await userRepository.create(username, password);
        existingUser = await userRepository.getById(id);

        const table = new Table({
            head: [chalk.cyan('ID'), chalk.cyan('Username'), chalk.cyan('Created at'), chalk.cyan('Callback URI Token')],
            colWidths: [40, 30, 30, 60],
        });

        table.push([
            existingUser.id,
            existingUser.username,
            existingUser.createdAt.toISOString(),
            existingUser.callbackUriToken,
        ]);

        console.log(chalk.bgGreen(`User "${username}" has been successfully created.`));
        console.log(table.toString());
        process.exit(0);
    });

program
    .command('user:delete')
    .argument('<username>')
    .action(async username => {
        const user = await userRepository.getByUsername(username);

        if (null === user) {
            console.log(chalk.bgYellow(`User "${username}" not found.`));
            process.exit(1);
        }

        const usersScenarioSchedulers = await scenarioSchedulerRepository.findByUserId(user.id);
        let newUser = undefined;

        if (0 < usersScenarioSchedulers.length) {
            const { moveScenarioSchedulers } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'moveScenarioSchedulers',
                    message: `The user "${username}" has ${usersScenarioSchedulers.length} association${1 === usersScenarioSchedulers.length ? '' : 's'} to scenario schedulers. Do you want to move schedulers under another user?`,
                },
            ]);

            if (!moveScenarioSchedulers) {
                console.log(chalk.bgYellow(`Aborting.`));
                process.exit(0);
            }

            const { newUsername } = await inquirer.prompt([
                { type: 'input', name: 'newUsername', message: 'Username:' },
            ]);

            newUser = await userRepository.getByUsername(newUsername);

            if (null === newUser) {
                console.log(chalk.bgYellow(`User "${newUsername}" not found. Aborting.`));
                process.exit(1);
            }
        }

        try {
            await databaseClient.transaction(async trx => {
                if (newUser) {
                    for (let scenarioScheduler of usersScenarioSchedulers) {
                        await scenarioSchedulerRepository.update(scenarioScheduler.id, newUser.id, scenarioScheduler.name, scenarioScheduler.flags, scenarioScheduler.expression, scenarioScheduler.config, trx);
                    }
                }

                await userRepository.delete(user.id, trx);
            });

            if (newUser) {
                console.log(chalk.bgGreen(`Scenario schedulers have been successfully moved under the user "${newUser.username}".`));
            }

            console.log(chalk.bgGreen(`User "${username}" has been successfully deleted.`));
            process.exit(0);
        } catch (err) {
            console.log(chalk.bgYellow(`Unable to delete the user "${username}". ${err.toString()}`));
            process.exit(1);
        }
    });

await program.parse(process.argv);

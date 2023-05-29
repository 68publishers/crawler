import { config as runDotenv } from 'dotenv';
import { Bootstrap } from '../bootstrap.mjs';
import { program } from 'commander';
import Table from 'cli-table3';
import inquirer from 'inquirer';

runDotenv();

const container = Bootstrap.boot();
const userRepository = container.resolve('userRepository');

program
    .command('user:list')
    .action(async () => {
        const users = await userRepository.list();

        if (0 >= users.length) {
            console.warn('No users found.');
            process.exit(0);
        }

        const table = new Table({
            head: ['ID', 'Username', 'Created at', 'Callback URI Token'],
            colWidths: [40, 30, 30, 60],
        });

        for (let user of users) {
            table.push([
                user.id,
                user.username,
                user.created_at.toISOString(),
                user.callback_uri_token,
            ]);
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

        const existingUser = await userRepository.findByUsername(username);

        if (null !== existingUser) {
            console.warn(`User "${username}" already exists.`);
            process.exit(1);
        }

        await userRepository.create(username, password);

        console.log(`User "${username}" has been successfully created.`);
        process.exit(0);
    });

program
    .command('user:delete')
    .argument('<id>')
    .action(async (id) => {
        if (await userRepository.delete(id)) {
            console.log('User has been successfully deleted.');
            process.exit(0);
        } else {
            console.warn('User not found.');
            process.exit(1);
        }
    });

await program.parse(process.argv);

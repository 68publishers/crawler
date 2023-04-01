<?php

namespace App\Command;

use Ramsey\Uuid\Uuid;
use App\Scenario\Result\Result;
use App\Scenario\ScenarioFactoryInterface;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Logger\ConsoleLogger;
use Symfony\Component\Console\Output\OutputInterface;

final class CrawlCommand extends Command
{
    protected static $defaultName = 'crawl';

    public function __construct(
        private readonly ScenarioFactoryInterface $scenarioFactory,
    ) {
        parent::__construct();
    }

    protected function configure()
    {
        $this->addArgument('scenarios', InputArgument::REQUIRED | InputArgument::IS_ARRAY, 'Names of scenarios.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $logger = new ConsoleLogger($output);
        $scenarios = $input->getArgument('scenarios');

        assert(is_array($scenarios));
        $result = new Result();
        $runtimeId = Uuid::uuid4()->toString();

        $output->writeln(sprintf(
            'Runtime ID %s',
            $runtimeId,
        ));

        foreach ($scenarios as $scenario) {
            assert(is_string($scenario));

            $result = $result->merge(
                $this->scenarioFactory->create($scenario)->run($runtimeId, $logger)
            );
        }

        $output->writeln(json_encode($result, JSON_PRETTY_PRINT));

        return 0;
    }
}

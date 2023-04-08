<?php

namespace App\Application\Scenario;

use Psr\Log\LoggerInterface;
use Throwable;
use App\Application\Scenario\Result\Result;

interface ScenarioInterface
{
    public function run(string $runtimeId, LoggerInterface $logger): Result;
}

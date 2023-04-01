<?php

namespace App\Scenario;

use Psr\Log\LoggerInterface;
use Throwable;
use App\Scenario\Result\Result;

interface ScenarioInterface
{
    public function run(string $runtimeId, LoggerInterface $logger): Result;
}

<?php

namespace App\Application\Scenario;

use InvalidArgumentException;

interface ScenarioFactoryInterface
{
    /**
     * @throws InvalidArgumentException
     */
    public function create(string $name): ScenarioInterface;
}

<?php

namespace App\Scenario;

use InvalidArgumentException;

interface ScenarioFactoryInterface
{
    /**
     * @throws InvalidArgumentException
     */
    public function create(string $name): ScenarioInterface;
}

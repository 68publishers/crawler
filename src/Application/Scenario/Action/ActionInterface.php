<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

interface ActionInterface
{
    public function apply(Browsershot $browsershot): void;
}

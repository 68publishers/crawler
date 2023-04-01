<?php

namespace App\Scenario\Action;

use App\Browsershot\Browsershot;

interface ActionInterface
{
    public function apply(Browsershot $browsershot): void;
}

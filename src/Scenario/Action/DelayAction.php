<?php

namespace App\Scenario\Action;

use App\Browsershot\Browsershot;

final class DelayAction implements ActionInterface
{
    public function __construct(
        private readonly int $delayInMilliseconds,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('delay', [
            'delay' => $this->delayInMilliseconds,
        ]);
    }
}

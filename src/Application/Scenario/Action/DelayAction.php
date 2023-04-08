<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

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

<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

final class HoverAction implements ActionInterface
{
    public function __construct(
        private readonly string $selector,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('hover', [
            'selector' => $this->selector,
        ]);
    }
}

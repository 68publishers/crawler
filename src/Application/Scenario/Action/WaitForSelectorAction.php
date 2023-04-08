<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

final class WaitForSelectorAction implements ActionInterface
{
    public function __construct(
        private readonly string $selector,
        private readonly bool $hidden = false,
        private readonly bool $visible = false,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('waitForSelector', [
            'selector' => $this->selector,
            'hidden' => $this->hidden,
            'visible' => $this->visible,
        ]);
    }
}

<?php

namespace App\Scenario\Action;

use App\Browsershot\Browsershot;

final class ClickAction implements ActionInterface
{
    public function __construct(
        private readonly string $selector,
        private readonly string $button = 'left',
        private readonly int $clickCount = 1,
        private readonly int $delay = 0,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('click', [
            'selector' => $this->selector,
            'button' => $this->button,
            'clickCount' => $this->clickCount,
            'delay' => $this->delay,
        ]);
    }
}

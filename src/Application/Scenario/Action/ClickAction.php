<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

final class ClickAction implements ActionInterface
{
    public function __construct(
        private readonly string $selector,
        private readonly string $button = 'left',
        private readonly int $clickCount = 1,
        private readonly int $delay = 0,
        private readonly bool $xpath = false,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('click', [
            'selector' => $this->selector,
            'button' => $this->button,
            'clickCount' => $this->clickCount,
            'delay' => $this->delay,
            'xpath' => $this->xpath,
        ]);
    }
}

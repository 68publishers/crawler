<?php

namespace App\Application\Scenario\Action;

use App\Application\Browsershot\Browsershot;

final class TypeAction implements ActionInterface
{
    public function __construct(
        private readonly string $selector,
        private readonly string $text = '',
        private readonly int $delay = 0,
    ) {}

    public function apply(Browsershot $browsershot): void
    {
        $browsershot->addScenarioAction('type', [
            'selector' => $this->selector,
            'text' => $this->text,
            'delay' => $this->delay,
        ]);
    }
}
